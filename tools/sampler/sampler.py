#!/usr/bin/env python3
"""
sampler.py — chop an audio file into samples and use AI to sort each
slice into bass / kick / melody / other folders.

Usage:
    python sampler.py input.mp3
    python sampler.py track.wav --method grid --length 0.25
    python sampler.py loop.wav --no-ai          # heuristics only
    python sampler.py *.wav -o my_samples       # batch mode

Slicing:
    onset (default)  transient-aligned cuts via librosa.onset.onset_detect
    grid             fixed-length windows (--length seconds)

Classification:
    AI mode (default) uses LAION CLAP zero-shot audio classification —
    the model embeds each slice and each candidate label into the same
    space and we pick the closest one.
    Fallback mode (--no-ai) uses spectral centroid + pitch confidence +
    duration features to make a rule-based call.
"""

import argparse
import sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

LABELS = ["bass", "kick", "melody", "other"]

# Natural-language prompts CLAP scores each slice against. Phrasing matters:
# concrete instrument names work better than abstract category names.
CLAP_PROMPTS = {
    "kick":   "the sound of a kick drum, bass drum, or low thump",
    "bass":   "the sound of a bass guitar or bass synth note",
    "melody": "the sound of a melodic instrument like piano, guitar, synth, or strings",
    "other":  "the sound of a snare, hi-hat, cymbal, vocal, percussion, or sound effect",
}


# ── Slicing ──────────────────────────────────────────────────────────────────

def slice_by_onsets(y, sr, min_duration=0.08, max_duration=2.0):
    """Cut at detected transients. Returns list of (start, end) sample pairs."""
    onset_samples = librosa.onset.onset_detect(
        y=y, sr=sr, backtrack=True, units="samples"
    )
    boundaries = list(onset_samples) + [len(y)]
    min_len = int(min_duration * sr)
    max_len = int(max_duration * sr)
    slices = []
    for i in range(len(boundaries) - 1):
        start = int(boundaries[i])
        end   = min(int(boundaries[i + 1]), start + max_len)
        if end - start >= min_len:
            slices.append((start, end))
    return slices


def slice_by_grid(y, sr, length_sec=0.5):
    """Cut into fixed-length chunks. Final chunk shorter than 0.1s is dropped."""
    step = int(length_sec * sr)
    floor = int(0.1 * sr)
    return [
        (i, min(i + step, len(y)))
        for i in range(0, len(y), step)
        if len(y) - i >= floor
    ]


# ── Silence filter ───────────────────────────────────────────────────────────

def is_silent(chunk, threshold_db=-50):
    """Drop slices that are essentially nothing — saves classifier work."""
    if len(chunk) == 0:
        return True
    rms = float(np.sqrt(np.mean(chunk ** 2)))
    if rms <= 0:
        return True
    return 20 * np.log10(rms) < threshold_db


# ── AI classification (CLAP zero-shot) ───────────────────────────────────────

class CLAPClassifier:
    """LAION CLAP zero-shot audio classifier.

    Lazy-imports torch + transformers so people who pass --no-ai don't
    need them installed.
    """

    def __init__(self):
        from transformers import ClapModel, ClapProcessor
        import torch

        self.torch = torch
        model_id = "laion/clap-htsat-unfused"
        print(f"  loading {model_id} (first run downloads ~600 MB)...")
        self.processor = ClapProcessor.from_pretrained(model_id)
        self.model     = ClapModel.from_pretrained(model_id).eval()

        # Pre-compute label embeddings once.
        self.label_keys = list(CLAP_PROMPTS.keys())
        prompts         = list(CLAP_PROMPTS.values())
        with torch.no_grad():
            text_in   = self.processor(text=prompts, return_tensors="pt", padding=True)
            text_emb  = self.model.get_text_features(**text_in)
            self.text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)

    def classify(self, audio, sr):
        # CLAP wants 48 kHz mono.
        if sr != 48000:
            audio = librosa.resample(audio, orig_sr=sr, target_sr=48000)
        with self.torch.no_grad():
            audio_in   = self.processor(audios=audio, sampling_rate=48000, return_tensors="pt")
            audio_emb  = self.model.get_audio_features(**audio_in)
            audio_emb  = audio_emb / audio_emb.norm(dim=-1, keepdim=True)
            scores     = (audio_emb @ self.text_emb.T)[0]
        return self.label_keys[int(scores.argmax())]


# ── Heuristic classifier (no model required) ─────────────────────────────────

def classify_heuristic(audio, sr):
    """Rule-based fallback that only needs librosa.

    Decision order:
      1. Very dark + short    → kick
      2. Pitched + low fundamental + sustained → bass
      3. Pitched + mid/high fundamental → melody
      4. Anything else → other
    """
    if len(audio) < int(0.05 * sr):
        return "other"

    centroid = float(np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr)))
    rms      = librosa.feature.rms(y=audio)[0]
    threshold = float(np.max(rms) * 0.1) if np.max(rms) > 0 else 0
    audible_frames = int(np.sum(rms > threshold))
    duration_sec   = audible_frames * 512 / sr   # default hop length

    try:
        f0, voiced_flag, _ = librosa.pyin(
            audio, fmin=30, fmax=2000, sr=sr, frame_length=2048
        )
        pitch_conf = float(np.nanmean(voiced_flag.astype(float)))
        median_f0  = float(np.nanmedian(f0)) if not np.all(np.isnan(f0)) else 0.0
    except Exception:
        pitch_conf = 0.0
        median_f0  = 0.0

    if centroid < 250 and duration_sec < 0.4:
        return "kick"
    if 30 < median_f0 < 250 and pitch_conf > 0.3 and duration_sec > 0.2:
        return "bass"
    if pitch_conf > 0.4 and median_f0 >= 250:
        return "melody"
    return "other"


# ── Per-file processing ──────────────────────────────────────────────────────

def process_file(src, out_root, classifier, args):
    print(f"\nLoading {src.name}...")
    y, sr = librosa.load(str(src), sr=None, mono=True)
    print(f"  {len(y) / sr:.1f}s @ {sr} Hz")

    if args.method == "onset":
        slices = slice_by_onsets(y, sr, args.min_duration, args.max_duration)
    else:
        slices = slice_by_grid(y, sr, args.length)
    print(f"  sliced into {len(slices)} candidates")

    counts = {label: 0 for label in LABELS}
    skipped = 0
    stem = src.stem

    for i, (start, end) in enumerate(slices):
        chunk = y[start:end]
        if is_silent(chunk):
            skipped += 1
            continue

        # Peak-normalise to -0.4 dB so all written samples sit at a usable level.
        peak = float(np.max(np.abs(chunk)))
        if peak > 0:
            chunk = chunk / peak * 0.95

        label = classifier(chunk, sr) if classifier else classify_heuristic(chunk, sr)
        counts[label] += 1
        outname = out_root / label / f"{stem}_{i:04d}.wav"
        sf.write(str(outname), chunk, sr)
        print(f"    [{i:04d}] {start / sr:6.2f}s  →  {label}")

    print(f"  saved {sum(counts.values())} samples ({skipped} silent skipped)")
    for label, n in counts.items():
        print(f"    {label:6s}: {n:3d}")
    return counts


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Chop audio files and AI-sort the slices into bass / kick / melody / other.",
    )
    parser.add_argument("input", nargs="+", help="One or more audio files (mp3, wav, flac, ogg)")
    parser.add_argument("-o", "--output", default="output", help="Output directory (default: ./output)")
    parser.add_argument(
        "--method", choices=["onset", "grid"], default="onset",
        help="onset = transient-aligned cuts, grid = fixed-length windows",
    )
    parser.add_argument("--length", type=float, default=0.5, help="Grid slice length in seconds (default 0.5)")
    parser.add_argument("--min-duration", type=float, default=0.08, help="Min onset slice in seconds")
    parser.add_argument("--max-duration", type=float, default=2.0,  help="Max onset slice in seconds")
    parser.add_argument("--no-ai", action="store_true", help="Skip CLAP, use feature heuristics only")
    args = parser.parse_args()

    out_root = Path(args.output)
    for label in LABELS:
        (out_root / label).mkdir(parents=True, exist_ok=True)

    classifier = None
    if not args.no_ai:
        try:
            clap = CLAPClassifier()
            classifier = clap.classify
        except Exception as e:
            print(f"  CLAP unavailable ({e!r}); falling back to heuristics.")
            print("  install with:  pip install transformers torch")

    totals = {label: 0 for label in LABELS}
    for path in args.input:
        src = Path(path)
        if not src.exists():
            print(f"skip — file not found: {src}")
            continue
        counts = process_file(src, out_root, classifier, args)
        for label in LABELS:
            totals[label] += counts[label]

    print("\n────── totals ──────")
    for label, n in totals.items():
        print(f"  {label:6s}: {n:4d} samples")
    print(f"  written to: {out_root.resolve()}")


if __name__ == "__main__":
    main()
