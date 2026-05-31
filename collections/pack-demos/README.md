# Pack Demos

Two ready-to-play Strudel patterns for each of the **50 GitHub sample
repos** listed in [`../../docs/STRUDEL_SAMPLE_REPOS.md`](../../docs/STRUDEL_SAMPLE_REPOS.md).
Total: **100** `.strudel` files.

Filenames follow `<slug>-<1|2>-<style>.strudel`, e.g.:

```
dirt-1-boom_bap.strudel        ← Tidal Dirt-Samples, boom-bap variant
dirt-2-techno.strudel          ← Tidal Dirt-Samples, techno variant
amiga-1-chiptune.strudel       ← Bubo Dough-Amiga, chiptune variant
amiga-2-idm.strudel            ← Bubo Dough-Amiga, glitchy IDM variant
```

## How they're built

Each demo:

1. Calls `samples('github:owner/repo')` so the pack's sample bank is
   loaded into the REPL.
2. Plays a complete pattern using the standard SuperDirt drum names
   (`bd`, `sd`, `hh`, `cp`, `oh`, `rim`, `tabla`) plus pitched synth
   voices (`sawtooth`, `square`, `triangle`, `sine`).

This means **every file plays out of the box** — Strudel ships with the
default Dirt-Samples bank loaded, so the drum names always resolve.
Once your custom pack has finished loading, swap any `s("...")` name in
the pattern for a sample name from the pack to hear it through that
sound.

## Templates

Each repo gets two of these 12 musical templates, picked to match the
pack's character (drum-leaning packs get beat patterns, ambient-leaning
packs get pads, etc.):

| Template   | Style              | BPM  | Key       |
| ---------- | ------------------ | ---- | --------- |
| `lofi`     | Lo-fi hip hop      | 72   | C minor   |
| `boom_bap` | Boom-bap hip hop   | 88   | A minor   |
| `house`    | House              | 124  | F minor   |
| `dnb`      | Drum and bass      | 174  | D minor   |
| `ambient`  | Ambient drone      | 60   | E♭ major  |
| `chiptune` | Chiptune / 8-bit   | 140  | A major   |
| `acid`     | Acid               | 132  | A minor   |
| `trap`     | Trap               | 140  | F minor   |
| `ethnic`   | World percussion   | 110  | D dorian  |
| `idm`      | IDM / glitch       | 128  | C minor   |
| `techno`   | Techno             | 130  | A minor   |
| `pop`      | Synth-pop          | 110  | G major   |

## Running

Open <https://strudel.cc>, paste a file's contents, hit `Ctrl+Enter`.
Or use the local `apps/lofi-player/` source view if you prefer.

## Regenerating / customising

The whole folder is generated from `_generate.py`. To change templates,
change repo→template assignments, or rename the slug, edit the script
and re-run:

```bash
python collections/pack-demos/_generate.py
```

It overwrites all `.strudel` files in the folder. Idempotent.
