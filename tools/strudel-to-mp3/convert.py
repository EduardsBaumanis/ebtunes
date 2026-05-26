#!/usr/bin/env python3
"""Render every .strudel file in input/ to a 5-minute MP3 in output/.

Strudel runs in headless Chromium (via Playwright), and the audio is
captured through Web Audio's MediaStreamDestination + MediaRecorder. The
resulting WebM/Opus blob is then transcoded to MP3 with ffmpeg.

Usage:
    python convert.py                    # 5-minute renders, every .strudel in input/
    python convert.py --duration 60      # 1-minute test renders
    python convert.py --input some/dir   # different input folder
    python convert.py --keep-webm        # keep the intermediate WebM file too

Requirements (install once):
    pip install playwright
    playwright install chromium
    apt install ffmpeg          # or: brew install ffmpeg
"""

import argparse
import asyncio
import base64
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    sys.exit("missing dependency — run:  pip install playwright  &&  playwright install chromium")


HERE   = Path(__file__).parent
INPUT  = HERE / "input"
OUTPUT = HERE / "output"
HTML   = HERE / "render.html"

DEFAULT_DURATION_S = 5 * 60   # 5 minutes


def transcode_to_mp3(webm_path, mp3_path):
    """Run ffmpeg to convert WebM/Opus → MP3 (VBR, ~190 kbps)."""
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg not found on PATH — install it and try again")
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-i", str(webm_path),
            "-codec:a", "libmp3lame",
            "-qscale:a", "2",   # VBR ~190 kbps; -qscale:a 0 = highest quality
            str(mp3_path),
        ],
        check=True,
    )


async def render_one(page, src, duration_s, out_dir, keep_webm):
    code = src.read_text()
    print(f"  • {src.name}  ({duration_s}s)", flush=True)

    # The page returns the recording as a data URL. For 5 min @ 192 kbps that's
    # ~9 MB of base64 over the CDP wire — fine, but use a long timeout.
    data_url = await page.evaluate(
        "([code, ms]) => window.renderStrudel(code, ms)",
        [code, duration_s * 1000],
    )
    if not isinstance(data_url, str) or not data_url.startswith("data:"):
        raise RuntimeError("renderer returned an unexpected payload")

    _, payload = data_url.split(",", 1)
    raw = base64.b64decode(payload)

    webm = out_dir / f"{src.stem}.webm"
    mp3  = out_dir / f"{src.stem}.mp3"
    webm.write_bytes(raw)

    transcode_to_mp3(webm, mp3)
    if not keep_webm:
        webm.unlink()
    print(f"      -> {mp3.name} ({mp3.stat().st_size // 1024} KB)", flush=True)


async def main_async(args):
    args.input.mkdir(parents=True, exist_ok=True)
    args.output.mkdir(parents=True, exist_ok=True)

    files = sorted(args.input.glob("*.strudel"))
    if not files:
        print(f"no .strudel files in {args.input}/")
        return

    print(f"found {len(files)} file(s); rendering each for {args.duration}s")
    print(f"  input : {args.input.resolve()}")
    print(f"  output: {args.output.resolve()}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                # Lets MediaRecorder run without a user gesture in headless mode.
                "--autoplay-policy=no-user-gesture-required",
                "--disable-blink-features=AutomationControlled",
                # Some Linux containers need this so the audio sandbox doesn't bail.
                "--disable-features=AudioServiceSandbox",
            ],
        )
        context = await browser.new_context()
        page    = await context.new_page()

        # Surface page errors and console messages so a crashing render is visible.
        page.on("pageerror", lambda exc: print(f"      [page error] {exc}", flush=True))
        page.on("console",   lambda msg: msg.type in ("error", "warning") and
                                          print(f"      [console.{msg.type}] {msg.text}", flush=True))

        await page.goto(HTML.absolute().as_uri())
        await page.wait_for_function("window.strudelReady === true", timeout=60_000)
        await page.wait_for_function(
            "() => document.getElementById('engine') && document.getElementById('engine').editor",
            timeout=60_000,
        )

        ok = 0
        for src in files:
            try:
                await render_one(page, src, args.duration, args.output, args.keep_webm)
                ok += 1
            except Exception as e:
                print(f"      FAILED — {e}", flush=True)

        await browser.close()
        print(f"done: {ok}/{len(files)} succeeded")


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--duration", type=int, default=DEFAULT_DURATION_S,
                        help=f"per-file render duration in seconds (default: {DEFAULT_DURATION_S})")
    parser.add_argument("--input",  type=Path, default=INPUT,  help="input folder (default: ./input)")
    parser.add_argument("--output", type=Path, default=OUTPUT, help="output folder (default: ./output)")
    parser.add_argument("--keep-webm", action="store_true",
                        help="keep the intermediate WebM/Opus file alongside the MP3")
    args = parser.parse_args()
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
