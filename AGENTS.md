# AGENTS.md

Guidance for coding and song-generation agents working in this repository.

## Repo Identity

This repo is a Strudel songbook and toolbench. Most musical source lives in
`collections/**/*.strudel`, lessons live in `courses/`, browser players live in
`apps/`, and generation/validation utilities live in `tools/`.

Before generating new music, read:

- `README.md` for the project map.
- `docs/SONG_GENERATION_CATALOG.md` for count-aware sound and note choices.
- Nearby `.strudel` files in the target collection for local style, naming,
  comments, tempo, and layer density.

## Song Generation Rules

- Prefer self-contained `.strudel` files that run in Strudel without build
  steps.
- Use `setcpm(BPM / 4)` unless the neighboring collection already uses a
  different convention or an interactive `slider(...)`.
- Use `stack(...)` for complete tracks. A normal full piece has 4-8 readable
  layers: kick, snare/clap, hats, bass, chords/pad, melody, texture, fill.
- Keep layer order scan-friendly: drums first, then bass, then harmonic and
  melodic material, then ear-candy or texture.
- Use default Dirt samples unless the sound concept requires an external pack.
  If a GitHub pack is used, add `samples('github:owner/repo')` near the top and
  only reference samples from that pack.
- Keep gains conservative. Dense electronic stacks should usually keep drums
  around `0.3-0.9`, synths around `0.2-0.6`, pads around `0.15-0.35`, and
  noise/texture lower.
- Use comments to explain non-obvious musical ideas, not every line. Existing
  files often use short section headers for layers.
- Avoid imports and module-style JavaScript. Top-level `samples(...)`,
  `setcpm(...)`, and one final Strudel expression are the safest shape. A small
  `const` for a repeated motif is acceptable only when it makes the pattern
  clearer and matches local style.

## Count-Aware Choices

The catalog shows the repo's current center of gravity:

- Most-used sounds: `hh`, `bd`, `sawtooth`, `white`, `sine`, `sd`,
  `triangle`, `rim`, `cp`, `oh`.
- Most-used explicit notes: `g4`, `a4`, `d4`, `e4`, `c4`, `d5`, `c5`, `b4`.
- The most crowded melodic register is octave 4, followed by octaves 5 and 3.

Use that deliberately:

- To blend in, anchor the track with familiar `hh`/`bd` drum grammar,
  `sawtooth` bass or pad, and mid-register notes.
- To make a track feel new, reduce constant `hh*8`/`hh*16`, add rests, use
  less common colors like `tabla`, `cb`, `cy`, `lt`, `mt`, `ht`, `casio`,
  `amen`, `break`, `brown`, `pink`, `square`, or external pack samples.
- For harmonic freshness, try `n(...).scale(...)`, modal centers outside C/A/G,
  and registers 0, 6, 7, or 8 when the style supports it.
- For structural freshness, use `struct`, `mask`, `chunk`, `iter`, `jux`,
  `off`, `euclid`, `choose`, or `pick` with restraint and a clear musical
  reason.

## Collection Fit

- Put new tracks in the collection that matches the brief. Use the existing
  filename pattern, usually `NN-kebab-title.strudel`.
- Continue numbering rather than overwriting unless the user asks to revise a
  specific file.
- Match the target folder's aesthetic before adding novelty. For example,
  `hard-bass` wants heavy kick/hats and acid or industrial motion; `jazz-piano`
  wants piano voicings and theory-forward harmony; `yt` and `game` want concise
  SFX gestures rather than long arrangements.
- If adding to `apps/izlase`, remember it is a curated app folder, not the main
  library.

## Validation And Similarity

Useful commands:

```bash
rg --files -g '*.strudel'
node tools/strudel-similarity.mjs path/to/file.strudel
python3 -m http.server 8000
npm start
```

For generated-agent workflows, `tools/agent/` has a Claude-based generator and
browser validator. Use it only when API keys and dependencies are available:

```bash
python tools/agent/agent.py "brief here" --validate
```

When validation is not available, at least inspect syntax carefully:

- Balanced parentheses and commas inside `stack(...)`.
- Valid sample names for the active sample bank.
- `note(...)` strings contain either pitch names, numeric values with
  `.scale(...)`, or intentional MIDI-style values.
- No accidental comments inside the final expression.

## Catalog Maintenance

`docs/SONG_GENERATION_CATALOG.md` is the repo's vocabulary map. If a task adds
many tracks or changes the musical vocabulary substantially, update the catalog
using the same counting rules documented there: strip comments, inspect
`s(...)`, `.sound(...)`, `.s(...)`, `note(...)`, `n(...)`, and `samples(...)`,
expand simple `*N` repeats, and keep folder context.

