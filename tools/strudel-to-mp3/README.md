# strudel-to-mp3

Drop `.strudel` files into [`input/`](./input), run the script, and 5-minute
MP3 renders appear in [`output/`](./output).

```
tools/strudel-to-mp3/
├── convert.py     # Python orchestrator (Playwright + ffmpeg)
├── render.html    # In-browser host: loads @strudel/repl, taps Web Audio,
│                  #   captures the output via MediaRecorder
├── input/         # ← put your .strudel files here
└── output/        # ← MP3 renders land here
```

## How it works

1. `convert.py` launches **headless Chromium** via Playwright.
2. The browser loads `render.html`, which boots `@strudel/repl` from unpkg
   and patches `AudioContext` so every node that would talk to the
   speakers goes through one shared master gain.
3. For each input file, a `MediaStreamDestination` is connected to that
   master gain, the strudel pattern is `evaluate()`d, and a
   `MediaRecorder` records the resulting WebM/Opus stream for the chosen
   duration.
4. The blob is base64-shipped back to Python, written to disk, and
   transcoded to MP3 with **ffmpeg** (`libmp3lame -qscale:a 2`,
   ~190 kbps VBR).

Rendering happens in **real time** — a 5-minute pattern takes 5 minutes
to render. Plan accordingly: 100 files × 5 minutes ≈ 8 hours of wall
time. Use `--duration 30` while you're iterating.

## Setup (once)

```bash
pip install playwright
playwright install chromium
# ffmpeg from your package manager:
sudo apt install ffmpeg          # Linux
brew install ffmpeg              # macOS
```

## Usage

```bash
# Default: every .strudel in ./input, 5-minute renders
python convert.py

# Quick 30-second test pass
python convert.py --duration 30

# Different folders
python convert.py --input ../../collections/pack-demos --output ./mp3s

# Keep the intermediate WebM/Opus file too
python convert.py --keep-webm
```

`convert.py --help` lists all flags.

## Tips

- The renderer pre-warms each pattern for ~1.5 seconds before it starts
  counting the duration, so async `samples('github:…')` loads finish
  before recording begins. If you still hear silence at the start of a
  render, the pack is probably very large — increase the pre-warm by
  editing the `setTimeout(r, 1500)` line in `render.html`.
- If a file produces an empty / silent MP3, run `python convert.py
  --keep-webm` and inspect the WebM directly. Console errors from the
  page are forwarded to the terminal — look for syntax errors in your
  pattern.
- Headless Chromium on minimal Linux containers sometimes complains
  about the audio sandbox; the `--disable-features=AudioServiceSandbox`
  flag is already in `convert.py` and usually fixes it. If not, run
  with `headless=False` (edit the script) and watch the page.
- Want longer tails? Edit the `setTimeout(r, 800)` line — that's the
  fade-out / reverb-tail window after the pattern stops.

## Caveats

- Real-time only. There's no offline / faster-than-real-time mode
  because Strudel uses `setTimeout`-based scheduling against
  `audioContext.currentTime`, which assumes a real-time clock.
- Output sample rate is whatever Chromium's AudioContext defaults to
  (usually 48 kHz). MP3 transcoding preserves it.
- The `samples('github:…')` calls hit raw.githubusercontent.com — needs
  internet on the machine running the renderer.
