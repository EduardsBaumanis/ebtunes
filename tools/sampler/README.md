# Sampler

Chop an audio file (`.mp3`, `.wav`, `.flac`, `.ogg`) into one-shot samples and
let an AI model sort each slice into the right folder:

```
output/
├── bass/      bass guitar / bass synth notes
├── kick/      kick drums, low thumps
├── melody/    melodic instrument hits — piano, guitar, synth, strings
└── other/     snares, hats, cymbals, vocals, fx — anything else
```

Useful for building drum / sample packs from existing tracks, prepping
folders to feed into Strudel's `s("…")`, or just exploring what's hiding
inside a long recording.

## Install

```bash
pip install -r requirements.txt
```

`librosa` needs `ffmpeg` to read mp3 — install via your package manager
(`apt install ffmpeg`, `brew install ffmpeg`, etc.) if it isn't already there.

The first AI run downloads the LAION CLAP model (~600 MB) into your
HuggingFace cache. After that it's offline.

## Usage

```bash
# Default: transient-aligned slicing + AI classification
python sampler.py track.mp3

# Fixed half-second grid windows
python sampler.py loop.wav --method grid --length 0.5

# Skip the AI model — pure feature heuristics, no torch needed
python sampler.py loop.wav --no-ai

# Batch — globs work too
python sampler.py recordings/*.wav -o my_pack
```

Slices are written as 16-bit PCM `.wav` files normalised to ‑0.4 dB so
they're immediately drag-and-droppable into a sampler.

## How the AI bit works

The `--no-ai` mode classifies by audio features:

- **kick** — very low spectral centroid (< 250 Hz) and short audible body
- **bass** — pitched fundamental between 30 Hz and 250 Hz with sustain
- **melody** — pitched fundamental ≥ 250 Hz with high voicing confidence
- **other** — everything else

The default mode swaps that out for **LAION CLAP**, a contrastive
text-audio model. Each candidate folder has a natural-language prompt
(`"the sound of a kick drum, bass drum, or low thump"` etc.); CLAP
embeds both the prompts and each audio slice, and we pick the prompt
with the highest cosine similarity. The prompts live at the top of
`sampler.py` — tweak them to bias the sorting (e.g. add `"808 kick"`
to the kick prompt for more hip-hop-leaning detection).

## Tuning

| Flag                | What it does                                                    | Default |
| ------------------- | --------------------------------------------------------------- | ------- |
| `--method onset`    | Cut at detected transients — best for drum loops, percussion    | ✓       |
| `--method grid`     | Cut on a fixed time grid — best for sustained / pad material    |         |
| `--length 0.5`      | Grid slice length in seconds                                    | 0.5     |
| `--min-duration`    | Drop onset slices shorter than this (in seconds)                | 0.08    |
| `--max-duration`    | Cap onset slices to this length (in seconds)                    | 2.0     |
| `--no-ai`           | Use heuristics only — no model download, no torch needed        | off     |
| `-o, --output DIR`  | Where to write the four sorted folders                          | output  |

## Tips

- For drum loops use `--method onset`; for ambient / pads use `--method grid`.
- If onset slicing is finding too few hits, lower `--min-duration` to 0.05.
- If everything is landing in `other/`, your audio is probably mid/high noise
  with no clear pitch — try `--no-ai` to see whether CLAP is the culprit
  or the material is genuinely ambiguous.
- The output folders are flat — sample names are `<source>_<index>.wav` so
  you can always trace a slice back to where it came from in the original.
