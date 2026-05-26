# Strudel pattern-generating agent

A small Python CLI that turns a natural-language brief into a complete
`.strudel` file via the Claude API. Built around the same
**validate-and-retry loop** that
[`tambo-ai/strudellm`](https://github.com/tambo-ai/strudellm) uses:
generated code is evaluated in headless Chromium and, if Strudel rejects
it, the error is fed back to Claude and the generation is retried.

```
tools/agent/
├── agent.py            CLI orchestrator (Anthropic SDK + Playwright)
├── system_prompt.md    Strudel composition guide given to Claude
├── examples/           4 few-shot .strudel files (lofi / jazz / ambient / techno)
├── validate.html       In-browser Strudel evaluator used by --validate
├── output/             Generated patterns land here
├── requirements.txt
└── README.md
```

## Setup

```bash
# 1. Anthropic SDK
pip install -r requirements.txt

# 2. Set your API key
export ANTHROPIC_API_KEY="sk-ant-…"

# 3. (Optional, only for --validate) Install Playwright's Chromium
playwright install chromium
```

## Usage

```bash
# Simplest: prompt → file in ./output/
python agent.py "slow lo-fi piano in C minor with brushed drums"

# Validate the result by evaluating it in headless Chromium; retry on
# error up to 2 times (the validate-and-retry loop)
python agent.py "minimal techno around 130 BPM" --validate

# Custom filename
python agent.py "ambient drone in F" -o ambient_drone.strudel

# Write to stdout instead of a file (useful for piping into other tools)
python agent.py "drum and bass break" --stdout

# Quiet mode (no progress on stderr; only prints the output path on stdout)
python agent.py "synth-pop hook" --quiet
```

`python agent.py --help` lists every flag.

### Outputs

By default the agent writes a `.strudel` file to `tools/agent/output/` and
prints the path on stdout. With `--stdout`, the pattern itself is
written to stdout and nothing is saved to disk.

### Live in lofi-player

Drop a generated file into `collections/lofi/`, `collections/jazz-piano/`,
`collections/study/`, or any other
playlist folder, then add the filename to the corresponding entry in
`apps/lofi-player/playlists.js`. The pattern shows up as a track on the next
page reload.

## How it works

1. **System message** — the agent loads `system_prompt.md` (the Strudel
   composition guide) plus four few-shot examples from `examples/`. The
   whole system prefix is marked `cache_control: ephemeral` so every
   subsequent invocation hits the cache and pays only for the user
   brief + the generated pattern.
2. **Generation** — `claude-opus-4-7` (Anthropic's most capable model)
   produces a single fenced code block containing the complete `.strudel`
   file.
3. **Extraction** — `agent.py` pulls the code out of the response with a
   regex matching ` ```strudel ` / ` ```js ` / ` ``` ` fences.
4. **Validation (optional)** — with `--validate`, Playwright launches
   headless Chromium, opens `validate.html` (which loads `@strudel/repl`
   from unpkg), and calls `window.validateStrudel(code)`. The page sets
   the code and calls `editor.evaluate()`. Any thrown exception, page
   error, or `console.error` is captured.
5. **Retry** — on validation failure the error message is appended to
   the conversation and the generation is repeated, up to `--retries`
   times (default 2). This is the core idea from `strudellm`'s
   `validateAndUpdateRepl` tool, ported to a Python CLI.

## Cost notes

The system prompt is ~2.5K tokens and the four examples are ~1.5K
tokens, so first-call cost is ~4K input tokens + the generated pattern
(~1K output tokens). After that, prompt caching means each subsequent
call costs roughly the user brief (~50 tokens) + the pattern, with the
4K cached prefix charged at the cache-read rate (~10× cheaper than full
input). At Opus 4.7 pricing this works out to single-digit cents per
generation after the first.

## Limitations

- **Real-time validation only.** The validator evaluates the pattern but
  doesn't listen — it can't catch musical problems (out-of-tune melodies,
  bad mixing). It catches *syntactic* and *runtime* errors only (typos,
  missing samples, wrong modifier names).
- **External-pack samples aren't validated.** If the pattern uses
  `samples('github:owner/repo')` and references samples by name, the
  validator can't tell whether those names actually exist in the pack
  (they're loaded asynchronously). Stick with the default Dirt-Samples
  bank if you want validation to be meaningful.
- **One pattern per call.** No batch generation; loop in your shell if
  you want to make many at once. Prompt caching means a tight loop is
  cheap.

## Where the validate-and-retry idea came from

I lifted the validate-and-retry loop architecture from the README of
[`tambo-ai/strudellm`](https://github.com/tambo-ai/strudellm), which
runs a similar loop server-side via Tambo's hosted agent framework
(their `validateAndUpdateRepl` tool). Their actual Strudel composition
prompt lives server-side in the Tambo dashboard, so this repo's
`system_prompt.md` is mine — distilled from writing 250+ patterns by
hand in this codebase.
