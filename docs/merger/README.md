# merger

A Python program that **generates Strudel songs out of samples chopped by
[`sampler/`](../sampler/)**. Where `sampler` slices an audio file into
one-shots and sorts them into `bass / kick / melody / other` folders, the
merger walks those folders and writes complete `.strudel` files that play
musical patterns built from those slices.

```
sampler/output/                            merger/output/
  ├── kick/                                  ├── strudel.json   ← index of every slice
  │   ├── kick_001.wav        ─────────►     ├── song-01-lofi-lofi-loop.strudel
  │   └── kick_002.wav                       ├── song-02-boombap-boom-bap-chop.strudel
  ├── bass/                                  ├── song-03-techno-techno-pump.strudel
  ├── melody/                                ├── song-04-ambient-ambient-drift.strudel
  └── other/                                 ├── song-05-breakbeat-breakbeat-chop.strudel
                                             └── …
```

## Quick start

```bash
# 1. Chop some audio with the sampler (one-time, see ../sampler/README.md):
cd ../sampler
python sampler.py mytrack.mp3 -o output

# 2. Run the merger pointed at the sampler's output:
cd ../merger
python merger.py -i ../sampler/output -n 12
```

That's it. You'll get `merger/output/strudel.json` (the sample index) plus
12 `.strudel` files, each picking a different template and randomly chosen
slices.

## Templates

Each song is built from one of five musical templates. By default the
merger cycles through them; pass `--templates` to restrict the set.

| Name | Style | Tempo | Theory |
|---|---|---|---|
| `lofi` | Slow, mellow, delayed | 70 BPM | Kick on 1+3, snare-role on 2+4, sparse melody w/ delay |
| `boombap` | 90s hip-hop chop | 88 BPM | Kick on 1 + &-of-3, walking bass, vinyl crackle |
| `techno` | Four-on-the-floor | 130 BPM | Pumping kick, sub bass, off-beat hat, sparse lead |
| `ambient` | Sparse atmospheric | ~50 BPM | No regular beat, drone bass, melody chops w/ long reverb |
| `breakbeat` | Chopped jungle/DnB | 168 BPM | Kick + percussion chopped break, atmospheric pads |

Sample-index choices are randomised — running the merger twice on the same
input gives different songs. Pass `--seed N` for reproducibility.

## How the samples reach Strudel

Strudel's `samples()` call expects a URL to a JSON file. The merger writes
`strudel.json` to the same folder as the `.strudel` files, with paths like
`kick/kick_001.wav` relative to a `_base` URL. By default `_base` is
`"./"` — meaning paths are relative to wherever `strudel.json` lives.

**Local testing.** Open one of the generated `.strudel` files in the
[`player/`](../player/) on your local server (`npx serve .`). The player
embeds strudel.cc via iframe — strudel.cc will fetch the JSON over the
public URL and load the samples from the relative paths.

**Public hosting.** If you want the songs to work on strudel.cc directly,
push the merger output to GitHub Pages (or any static host) and pass:

```bash
python merger.py --base-url 'github:EduardsBaumanis/ebtesti/main/merger/output/'
```

The `github:owner/repo/branch/path/` form is the standard Strudel
sample-pack URL — strudel.cc resolves it to
`raw.githubusercontent.com/...` automatically.

## CLI flags

```
-i, --input      Sampler output folder       (default: ../sampler/output)
-o, --output     Where to write the songs    (default: ./output)
-n, --count      How many songs to generate  (default: 8)
--seed N         Reproducible random run     (default: random)
--templates a,b  Restrict to these templates (default: all 5)
--base-url URL   strudel.json _base URL      (default: "./")
```

## Notes / gotchas

- **Empty categories are fine.** If a category has no samples (the
  sampler classified everything as `other`, say) the templates skip the
  layer that would have used it instead of dying.
- **The sampler categorises drums into `other`.** Snares, hats, claps,
  vocals, FX — anything that isn't a kick, sustained bass, or pitched
  melody — lands in `other`. The templates treat `other` as a
  general-purpose percussion / texture pool.
- **Slices keep their original filenames.** A `kick_007.wav` in the
  sampler output stays `kick_007.wav` in the merger output, so you can
  always trace a slice back to where it came from.
- **No dependencies.** Pure stdlib Python. The audio analysis happened
  in `sampler/`; the merger only manipulates filenames + writes text.
