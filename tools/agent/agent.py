#!/usr/bin/env python3
"""Strudel pattern-generating agent.

Takes a natural-language brief and uses the Anthropic Claude API
(claude-opus-4-7 by default) to write a complete .strudel file in the same
style as the patterns elsewhere in this repo. Optionally validates the
output by evaluating it in headless Chromium — if Strudel throws, the
error is fed back to Claude and the generation retried up to N times.

This is the same validate-and-retry loop the tambo-ai/strudellm project
uses (their `validateAndUpdateRepl` tool), implemented in Python with the
Anthropic SDK + Playwright.

Usage:
    python agent.py "slow lo-fi piano in C minor with brushed drums"
    python agent.py "minimal techno around 130 BPM" --validate
    python agent.py "ambient drone in F" -o my_pattern.strudel
    python agent.py --help

Environment:
    ANTHROPIC_API_KEY  — required

Setup:
    pip install -r requirements.txt
    playwright install chromium    # only if you use --validate
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

try:
    import anthropic
except ImportError:
    sys.exit("missing dependency: pip install anthropic")


HERE          = Path(__file__).parent
SYSTEM_PATH   = HERE / "system_prompt.md"
EXAMPLES_DIR  = HERE / "examples"
OUTPUT_DIR    = HERE / "output"
VALIDATE_HTML = HERE / "validate.html"

DEFAULT_MODEL = "claude-opus-4-7"
DEFAULT_MAX_TOKENS = 4000


# ── Few-shot examples ────────────────────────────────────────────────────────
#
# Loaded once into the cached system message so Claude has concrete style
# anchors to copy from. The examples folder is a curated subset of
# patterns from this repo (lofi, jazz, ambient, techno).

def load_examples() -> str:
    if not EXAMPLES_DIR.is_dir():
        return ""
    parts: list[str] = []
    for path in sorted(EXAMPLES_DIR.glob("*.strudel")):
        parts.append(
            f'<example filename="{path.name}">\n{path.read_text()}\n</example>'
        )
    return "\n\n".join(parts)


# ── Request construction ─────────────────────────────────────────────────────
#
# System message is two blocks:
#   1. The composition guide (system_prompt.md)
#   2. The few-shot examples
# Both are cached — cache_control on the LAST block caches everything before
# it too. With a frozen system prompt + frozen examples and a per-call user
# brief, every invocation hits the cache after the first.

def build_system_blocks(system_text: str, examples_text: str) -> list[dict]:
    blocks: list[dict] = [{"type": "text", "text": system_text}]
    if examples_text:
        blocks.append({
            "type": "text",
            "text": (
                "# Reference examples\n\n"
                "Below are four well-formed .strudel files from this repo, "
                "shown so you can match their header convention, structure, "
                "and modifier vocabulary. Don't copy them — use them as "
                "style references when generating a new pattern.\n\n"
                + examples_text
            ),
        })
    # Cache the whole system prefix.
    blocks[-1]["cache_control"] = {"type": "ephemeral"}
    return blocks


# ── Code extraction ──────────────────────────────────────────────────────────

CODE_BLOCK_RE = re.compile(
    r"```(?:strudel|js|javascript)?\s*\n(.*?)```",
    re.DOTALL,
)

def extract_code(text: str) -> str:
    """Pull the fenced code block out of Claude's response.

    Falls back to the whole response if no fence is present (e.g. Claude
    returned bare code, against instructions — still salvageable)."""
    matches = CODE_BLOCK_RE.findall(text)
    if matches:
        return max(matches, key=len).strip()
    return text.strip()


def derive_filename(brief: str) -> str:
    """A filesystem-friendly slug derived from the user's brief."""
    slug = re.sub(r"[^a-z0-9]+", "-", brief.lower()).strip("-")[:60]
    return (slug or "pattern") + ".strudel"


# ── Validation in headless Chromium ──────────────────────────────────────────

def validate_pattern(code: str, timeout_s: float = 12.0) -> str | None:
    """Evaluate `code` via @strudel/repl in headless Chromium.

    Returns None on clean evaluation, or an error message string on
    failure. The browser is launched lazily inside this function so the
    import + chromium launch cost is paid only when --validate is used.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return (
            "validation skipped — playwright not installed. "
            "Run: pip install playwright && playwright install chromium"
        )
    if not VALIDATE_HTML.exists():
        return f"validation skipped — {VALIDATE_HTML} missing"

    captured_errors: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--autoplay-policy=no-user-gesture-required",
                "--disable-features=AudioServiceSandbox",
            ],
        )
        try:
            context = browser.new_context()
            page    = context.new_page()
            # Forward page-level + console errors to our list. These are
            # what tell us Strudel rejected the pattern.
            page.on("pageerror", lambda exc: captured_errors.append(str(exc)))
            page.on("console", lambda msg: (
                msg.type == "error" and captured_errors.append(msg.text)
            ))
            page.goto(VALIDATE_HTML.absolute().as_uri())
            page.wait_for_function("window.strudelReady === true", timeout=20_000)
            err = page.evaluate(
                "(code) => window.validateStrudel(code)",
                code,
            )
            if isinstance(err, str) and err:
                captured_errors.append(err)
            # Give the runtime a moment to surface any async errors that
            # only fire once the pattern starts ticking.
            page.wait_for_timeout(int(timeout_s * 1000 * 0.15))
        finally:
            browser.close()

    if not captured_errors:
        return None
    # Surface the first error — usually the underlying cause; later ones
    # are typically cascading.
    return captured_errors[0]


# ── Main loop ────────────────────────────────────────────────────────────────

def generate(
    brief: str,
    *,
    client: anthropic.Anthropic,
    model: str,
    max_tokens: int,
    system_blocks: list[dict],
    validate: bool,
    retries: int,
    verbose: bool,
) -> tuple[str, list[dict]]:
    """Generate code; on validation failure, retry with error feedback.

    Returns (code, conversation_messages). The conversation messages are
    useful for debugging or for letting the caller continue the thread.
    """
    messages: list[dict] = [{
        "role": "user",
        "content": f"Compose a Strudel pattern for:\n\n{brief}",
    }]

    code = ""
    for attempt in range(retries + 1):
        if verbose:
            print(f"  → request {attempt + 1}/{retries + 1} "
                  f"(model={model}, max_tokens={max_tokens})",
                  file=sys.stderr, flush=True)

        try:
            response = client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system_blocks,
                messages=messages,
            )
        except anthropic.AuthenticationError:
            sys.exit("ANTHROPIC_API_KEY is missing or invalid")
        except anthropic.RateLimitError as e:
            sys.exit(f"rate limited: {e}")
        except anthropic.APIError as e:
            sys.exit(f"API error ({getattr(e, 'status', '?')}): {e.message}")

        if verbose:
            u = response.usage
            cache_read   = getattr(u, "cache_read_input_tokens",   0) or 0
            cache_create = getattr(u, "cache_creation_input_tokens", 0) or 0
            print(f"    tokens: in={u.input_tokens}  "
                  f"cache_read={cache_read}  cache_create={cache_create}  "
                  f"out={u.output_tokens}",
                  file=sys.stderr, flush=True)

        text = "".join(
            b.text for b in response.content if getattr(b, "type", None) == "text"
        )
        code = extract_code(text)

        if not validate:
            return code, messages

        err = validate_pattern(code)
        if err is None:
            if verbose:
                print("    validation: OK", file=sys.stderr, flush=True)
            return code, messages

        if verbose:
            print(f"    validation: {err}", file=sys.stderr, flush=True)

        if attempt == retries:
            break

        # Feed the error back to Claude and retry. This is the same
        # validate-and-retry loop pattern as tambo-ai/strudellm.
        messages.append({"role": "assistant", "content": text})
        messages.append({
            "role": "user",
            "content": (
                "That pattern threw an error when evaluated in the "
                "Strudel REPL:\n\n"
                f"```\n{err}\n```\n\n"
                "Return a corrected version. Output one fenced code "
                "block — same format rules as before."
            ),
        })

    return code, messages


def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("brief", nargs="+", help="Natural-language description of the song")
    parser.add_argument("-o", "--output", help="Output filename (default: derived from brief)")
    parser.add_argument("--out-dir", type=Path, default=OUTPUT_DIR, help="Output directory")
    parser.add_argument("--model", default=DEFAULT_MODEL,
                        help=f"Anthropic model id (default {DEFAULT_MODEL})")
    parser.add_argument("--max-tokens", type=int, default=DEFAULT_MAX_TOKENS,
                        help=f"Max output tokens (default {DEFAULT_MAX_TOKENS})")
    parser.add_argument("--validate", action="store_true",
                        help="Evaluate in headless Chromium; retry on error")
    parser.add_argument("--retries", type=int, default=2,
                        help="Validation retries (default 2)")
    parser.add_argument("-q", "--quiet", action="store_true",
                        help="Suppress progress output on stderr")
    parser.add_argument("--stdout", action="store_true",
                        help="Write the pattern to stdout instead of a file")
    args = parser.parse_args()

    brief = " ".join(args.brief).strip()
    if not brief:
        sys.exit("empty brief")

    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY not set in environment")

    if not SYSTEM_PATH.exists():
        sys.exit(f"system prompt missing: {SYSTEM_PATH}")

    system_text   = SYSTEM_PATH.read_text()
    examples_text = load_examples()
    system_blocks = build_system_blocks(system_text, examples_text)

    client = anthropic.Anthropic()

    verbose = not args.quiet
    if verbose:
        print(f"Brief: {brief}", file=sys.stderr)
        print(f"Examples: {len(list(EXAMPLES_DIR.glob('*.strudel')))} loaded "
              f"({sum(p.stat().st_size for p in EXAMPLES_DIR.glob('*.strudel'))} bytes)",
              file=sys.stderr)

    code, _ = generate(
        brief,
        client=client,
        model=args.model,
        max_tokens=args.max_tokens,
        system_blocks=system_blocks,
        validate=args.validate,
        retries=args.retries,
        verbose=verbose,
    )

    if args.stdout:
        print(code)
        return

    args.out_dir.mkdir(parents=True, exist_ok=True)
    filename = args.output or derive_filename(brief)
    if not filename.endswith(".strudel"):
        filename += ".strudel"
    out_path = args.out_dir / filename
    out_path.write_text(code)

    if verbose:
        print(f"\n→ wrote {out_path}", file=sys.stderr)
    print(out_path)


if __name__ == "__main__":
    main()
