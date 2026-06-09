# Song Generation Catalog

Generated on 2026-06-09 by scanning the repository pattern library.

This is a practical map for writing new Strudel pieces in this repo. It counts the sound sources, synth instruments, explicit pitch names, numeric note tokens, scale degrees, chord stacks, and sample packs that already appear in the patterns.

## Scope

| Metric | Value |
| --- | --- |
| Pattern files scanned | 749 |
| Primary extension | `*.strudel` |
| Included extension outlier | `collections/idm/04-aphex-sleep.txt` |
| Areas scanned | `collections`, `courses`, `apps/izlase`, `tools/agent/examples`, `tools/orginals` |
| Trigger sample calls | 1974 calls across 669 files |
| Synth/instrument calls | 2370 calls across 715 files |
| Pitch calls | 2362 note() calls and 18 n() calls |
| External sample-pack loads | 124 samples() calls |

## Counting Rules

- Counts come from active code after removing line and block comments.
- `s(...)` strings are counted as trigger samples. `.sound(...)`, `sound(...)`, and `.s(...)` strings are counted as synth/instrument sources.
- `note(...)` strings are split into individual pitches, including notes inside chord stacks like `[c4,e4,g4]`. Simple repeats such as `hh*8` and `c3*4` are expanded.
- `n(...)` strings and numeric pick lists are counted as scale-degree vocabulary. Numeric values inside `note(...)`, such as `0 2 4` or `60 62 64`, are kept separately as numeric note tokens because they may be MIDI values or scale degrees when chained with `.scale(...)`.
- The catalog counts literal source references, not rendered performance-time events. It does not fully expand Euclidean rhythm, random choice probability, `slow`, `fast`, or conditional modifiers.
- Note spellings are preserved as written: `fs4`, `f#4`, `bb3`, and `as3` remain separate spellings.

## Repo Introduction

This repo is a Strudel songbook first: hundreds of self-contained `.strudel` pieces live under `collections/`, lessons live under `courses/`, and small browser apps in `apps/` play or rate those pieces. The musical center of gravity is electronic: hats and kicks are everywhere, basses are usually `sawtooth` or `sine`, and melodic material tends to sit around octaves 3-5. There are also strong specialty islands: piano jazz, medieval/modal pieces, YouTube and game SFX, sample-pack demos, technique studies, the closing `finisher` album, and the `underused-palette` album that deliberately raises rare sound and note tokens from the catalog.

## Overall Fingerprint

| Metric | Value |
| --- | --- |
| Unique sound tokens | 59 |
| Total sound references | 11594 |
| Trigger sample references | 9222 across 54 tokens |
| Synth/instrument references | 2372 across 8 tokens |
| Explicit pitch references | 19255 across 141 pitch spellings |
| Numeric `note()` tokens | 119 across 17 numeric tokens |
| Scale-degree `n()` references | 143 across 14 degree tokens |
| Chord stack references | 2227 across 560 distinct stacks |

Top sounds: `hh` 5118, `bd` 1579, `sawtooth` 1147, `white` 816, `sine` 587, `sd` 516, `triangle` 464, `rim` 284, `cp` 265, `oh` 186, `piano` 114, `square` 57

Top explicit notes: `g4` 958, `a4` 817, `d4` 730, `e4` 728, `c4` 715, `d5` 698, `c5` 673, `a3` 581, `b4` 574, `e5` 564, `f4` 560, `g3` 536

Top pitch classes: `a` 2603, `g` 2583, `d` 2488, `c` 2410, `e` 2034, `f` 1515, `b` 1253, `bb` 1096, `eb` 948, `fs` 674, `ab` 526, `cs` 380

## Generation Guidance From The Counts

- To sound native to this repo, start with familiar anchors: `hh`, `bd`, `sawtooth`, `sine`, `triangle`, and mid-register notes around `g4`, `a4`, `d4`, `e4`, and `c4`.
- To avoid making another average repo track, reduce always-on `hh*8` or `hh*16`, give silence real space, and reach for underused percussion such as `tabla`, `cb`, `cy`, `lt`, `mt`, `ht`, `casio`, or `rave` when the style allows it.
- `sawtooth` is the main bass/pad voice. Use it when you want continuity; switch to `square`, `piano`, filtered noise, or pack-specific samples when you need novelty.
- Octave 4 dominates melody. Octaves 0, 6, 7, and 8 are rare, so they read as sub impact, sparkle, or SFX quickly.
- The catalog has many chord stacks but relatively few `n()` scale-degree patterns. For fresh generative pieces, `n(...).scale(...)`, `pick`, `choose`, `iter`, `chunk`, `mask`, and `struct` are good routes.
- External sample packs are common in `collections/pack-demos/` and `collections/study/`, but most album tracks use the default Dirt bank. Load a GitHub pack only when it is central to the piece.

## Function Call Inventory

| Call form | Calls | Files with call |
| --- | --- | --- |
| `s(...)` | 1974 | 669 |
| `.sound(...)` | 2196 | 660 |
| `sound(...)` | 0 | 0 |
| `.s(...)` | 174 | 59 |
| `note(...)` | 2362 | 714 |
| `n(...)` | 18 | 18 |
| `samples(...)` | 124 | 124 |

## Complete Sound Vocabulary

This table combines trigger samples and synth/instrument sources. `Total` is `s(...)` plus `.sound(...)`/`.s(...)`.

| Sound token | Total | As `s()` | As synth/instrument | Files | Top folders |
| --- | --- | --- | --- | --- | --- |
| `hh` | 5118 | 5118 | 0 | 479 | `collections/pack-demos` 758, `collections/genres` 731, `collections/footwork` 434 |
| `bd` | 1579 | 1579 | 0 | 564 | `collections/pack-demos` 279, `collections/genres` 120, `collections/underused-palette` 111 |
| `sawtooth` | 1147 | 0 | 1147 | 590 | `collections/pack-demos` 143, `collections/genres` 134, `collections/harmonic` 90 |
| `white` | 816 | 816 | 0 | 89 | `collections/harmonic` 128, `collections/study` 112, `collections/gardens-of-broken-clocks` 99 |
| `sine` | 587 | 0 | 587 | 462 | `collections/genres` 43, `collections/amapiano` 42, `collections/underused-palette` 40 |
| `sd` | 516 | 516 | 0 | 226 | `collections/pack-demos` 121, `collections/genres` 86, `collections/lofi` 52 |
| `triangle` | 464 | 0 | 464 | 403 | `collections/pack-demos` 63, `collections/genres` 48, `collections/underused-palette` 40 |
| `rim` | 284 | 283 | 1 | 134 | `collections/amapiano` 48, `collections/gardens-of-broken-clocks` 39, `collections/rim` 24 |
| `cp` | 265 | 265 | 0 | 155 | `collections/pack-demos` 49, `collections/hard-bass` 33, `collections/footwork` 32 |
| `oh` | 186 | 186 | 0 | 124 | `collections/pack-demos` 34, `collections/genres` 32, `collections/lofi` 31 |
| `piano` | 114 | 0 | 114 | 42 | `collections/jazz-piano` 61, `collections/study` 24, `courses/Skola` 14 |
| `square` | 57 | 0 | 57 | 51 | `collections/game` 12, `collections/idm` 9, `collections/pack-demos` 6 |
| `metal` | 53 | 53 | 0 | 10 | `collections/bone-rattle-gabber` 52, `collections/finisher` 1 |
| `cy` | 45 | 45 | 0 | 32 | `collections/genres` 19, `collections/hard-bass` 10, `collections/vocals` 4 |
| `tabla` | 45 | 45 | 0 | 20 | `collections/genres` 28, `collections/hard-bass` 7, `collections/vocals` 4 |
| `cb` | 20 | 20 | 0 | 10 | `collections/genres` 13, `collections/hard-bass` 4, `collections/vocals` 2 |
| `lt` | 16 | 16 | 0 | 7 | `collections/study` 5, `apps/izlase` 4, `collections/game` 4 |
| `alphabet:0` | 15 | 14 | 1 | 14 | `collections/vocals` 14, `collections/finisher` 1 |
| `alphabet:8` | 15 | 15 | 0 | 10 | `collections/vocals` 14, `collections/finisher` 1 |
| `alphabet:14` | 14 | 13 | 1 | 13 | `collections/vocals` 13, `collections/finisher` 1 |
| `bd:4` | 14 | 14 | 0 | 3 | `collections/underused-palette` 10, `courses/Skola` 4 |
| `alphabet:4` | 12 | 12 | 0 | 9 | `collections/vocals` 6, `collections/underused-palette` 5, `collections/finisher` 1 |
| `alphabet:13` | 12 | 12 | 0 | 9 | `collections/vocals` 7, `collections/underused-palette` 5 |
| `alphabet:11` | 11 | 11 | 0 | 6 | `collections/vocals` 11 |
| `sd:3` | 9 | 9 | 0 | 3 | `collections/underused-palette` 7, `collections/prog` 2 |
| `alphabet:7` | 9 | 9 | 0 | 6 | `collections/vocals` 6, `collections/underused-palette` 3 |
| `alphabet:18` | 9 | 9 | 0 | 5 | `collections/underused-palette` 5, `collections/vocals` 4 |
| `sd:1` | 8 | 8 | 0 | 2 | `collections/underused-palette` 6, `collections/prog` 2 |
| `sd:2` | 8 | 8 | 0 | 2 | `collections/underused-palette` 6, `collections/prog` 2 |
| `brown` | 7 | 7 | 0 | 4 | `collections/underused-palette` 6, `collections/similarity-gradient` 1 |
| `numbers:2` | 7 | 7 | 0 | 4 | `collections/underused-palette` 5, `collections/vocals` 2 |
| `pink` | 6 | 6 | 0 | 4 | `collections/underused-palette` 5, `collections/similarity-gradient` 1 |
| `alphabet:1` | 6 | 6 | 0 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `alphabet:17` | 6 | 6 | 0 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `alphabet:19` | 6 | 6 | 0 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `alphabet:21` | 6 | 6 | 0 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `alphabet:5` | 6 | 6 | 0 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `numbers:7` | 6 | 6 | 0 | 3 | `collections/underused-palette` 5, `collections/vocals` 1 |
| `rd` | 5 | 5 | 0 | 3 | `collections/underused-palette` 3, `collections/prog` 2 |
| `alphabet:23` | 5 | 5 | 0 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `alphabet:3` | 5 | 5 | 0 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `numbers:1` | 5 | 5 | 0 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `numbers:3` | 5 | 5 | 0 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `numbers:4` | 5 | 5 | 0 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `numbers:0` | 5 | 5 | 0 | 3 | `collections/underused-palette` 4, `collections/vocals` 1 |
| `ht` | 5 | 5 | 0 | 2 | `collections/underused-palette` 4, `courses/Skola` 1 |
| `mt` | 5 | 5 | 0 | 2 | `collections/underused-palette` 4, `courses/Skola` 1 |
| `casio` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/study` 1 |
| `numbers:5` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `numbers:6` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `numbers:8` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `numbers:9` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `alphabet:12` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `alphabet:24` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `alphabet:25` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `alphabet:9` | 4 | 4 | 0 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `oh:1` | 3 | 3 | 0 | 2 | `collections/underused-palette` 2, `collections/acid` 1 |
| `break` | 3 | 3 | 0 | 3 | `collections/finisher` 1, `collections/study` 1, `collections/underused-palette` 1 |
| `amen` | 3 | 3 | 0 | 3 | `collections/finisher` 1, `collections/study` 1, `collections/underused-palette` 1 |

## Trigger Samples Only

| Sample token | Refs | Files | Top folders |
| --- | --- | --- | --- |
| `hh` | 5118 | 479 | `collections/pack-demos` 758, `collections/genres` 731, `collections/footwork` 434 |
| `bd` | 1579 | 564 | `collections/pack-demos` 279, `collections/genres` 120, `collections/underused-palette` 111 |
| `white` | 816 | 89 | `collections/harmonic` 128, `collections/study` 112, `collections/gardens-of-broken-clocks` 99 |
| `sd` | 516 | 226 | `collections/pack-demos` 121, `collections/genres` 86, `collections/lofi` 52 |
| `rim` | 283 | 133 | `collections/amapiano` 48, `collections/gardens-of-broken-clocks` 39, `collections/rim` 24 |
| `cp` | 265 | 155 | `collections/pack-demos` 49, `collections/hard-bass` 33, `collections/footwork` 32 |
| `oh` | 186 | 124 | `collections/pack-demos` 34, `collections/genres` 32, `collections/lofi` 31 |
| `metal` | 53 | 10 | `collections/bone-rattle-gabber` 52, `collections/finisher` 1 |
| `cy` | 45 | 32 | `collections/genres` 19, `collections/hard-bass` 10, `collections/vocals` 4 |
| `tabla` | 45 | 20 | `collections/genres` 28, `collections/hard-bass` 7, `collections/vocals` 4 |
| `cb` | 20 | 10 | `collections/genres` 13, `collections/hard-bass` 4, `collections/vocals` 2 |
| `lt` | 16 | 7 | `collections/study` 5, `apps/izlase` 4, `collections/game` 4 |
| `alphabet:8` | 15 | 10 | `collections/vocals` 14, `collections/finisher` 1 |
| `alphabet:0` | 14 | 13 | `collections/vocals` 13, `collections/finisher` 1 |
| `bd:4` | 14 | 3 | `collections/underused-palette` 10, `courses/Skola` 4 |
| `alphabet:14` | 13 | 12 | `collections/vocals` 12, `collections/finisher` 1 |
| `alphabet:4` | 12 | 9 | `collections/vocals` 6, `collections/underused-palette` 5, `collections/finisher` 1 |
| `alphabet:13` | 12 | 9 | `collections/vocals` 7, `collections/underused-palette` 5 |
| `alphabet:11` | 11 | 6 | `collections/vocals` 11 |
| `sd:3` | 9 | 3 | `collections/underused-palette` 7, `collections/prog` 2 |
| `alphabet:7` | 9 | 6 | `collections/vocals` 6, `collections/underused-palette` 3 |
| `alphabet:18` | 9 | 5 | `collections/underused-palette` 5, `collections/vocals` 4 |
| `sd:1` | 8 | 2 | `collections/underused-palette` 6, `collections/prog` 2 |
| `sd:2` | 8 | 2 | `collections/underused-palette` 6, `collections/prog` 2 |
| `brown` | 7 | 4 | `collections/underused-palette` 6, `collections/similarity-gradient` 1 |
| `numbers:2` | 7 | 4 | `collections/underused-palette` 5, `collections/vocals` 2 |
| `pink` | 6 | 4 | `collections/underused-palette` 5, `collections/similarity-gradient` 1 |
| `alphabet:1` | 6 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `alphabet:17` | 6 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `alphabet:19` | 6 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `alphabet:21` | 6 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `alphabet:5` | 6 | 4 | `collections/underused-palette` 3, `collections/vocals` 3 |
| `numbers:7` | 6 | 3 | `collections/underused-palette` 5, `collections/vocals` 1 |
| `rd` | 5 | 3 | `collections/underused-palette` 3, `collections/prog` 2 |
| `alphabet:23` | 5 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `alphabet:3` | 5 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `numbers:1` | 5 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `numbers:3` | 5 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `numbers:4` | 5 | 3 | `collections/underused-palette` 3, `collections/vocals` 2 |
| `numbers:0` | 5 | 3 | `collections/underused-palette` 4, `collections/vocals` 1 |
| `ht` | 5 | 2 | `collections/underused-palette` 4, `courses/Skola` 1 |
| `mt` | 5 | 2 | `collections/underused-palette` 4, `courses/Skola` 1 |
| `casio` | 4 | 2 | `collections/underused-palette` 3, `collections/study` 1 |
| `numbers:5` | 4 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `numbers:6` | 4 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `numbers:8` | 4 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `numbers:9` | 4 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `alphabet:12` | 4 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `alphabet:24` | 4 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `alphabet:25` | 4 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `alphabet:9` | 4 | 2 | `collections/underused-palette` 3, `collections/vocals` 1 |
| `oh:1` | 3 | 2 | `collections/underused-palette` 2, `collections/acid` 1 |
| `break` | 3 | 3 | `collections/finisher` 1, `collections/study` 1, `collections/underused-palette` 1 |
| `amen` | 3 | 3 | `collections/finisher` 1, `collections/study` 1, `collections/underused-palette` 1 |

## Synth And Instrument Sources

| Instrument token | Refs | Files | Top folders |
| --- | --- | --- | --- |
| `sawtooth` | 1147 | 590 | `collections/pack-demos` 143, `collections/genres` 134, `collections/harmonic` 90 |
| `sine` | 587 | 462 | `collections/genres` 43, `collections/amapiano` 42, `collections/underused-palette` 40 |
| `triangle` | 464 | 403 | `collections/pack-demos` 63, `collections/genres` 48, `collections/underused-palette` 40 |
| `piano` | 114 | 42 | `collections/jazz-piano` 61, `collections/study` 24, `courses/Skola` 14 |
| `square` | 57 | 51 | `collections/game` 12, `collections/idm` 9, `collections/pack-demos` 6 |
| `rim` | 1 | 1 | `collections/hard-bass` 1 |
| `alphabet:0` | 1 | 1 | `collections/vocals` 1 |
| `alphabet:14` | 1 | 1 | `collections/vocals` 1 |

## Explicit Pitch Notes

These are all pitch-name tokens found inside `note(...)` strings and simple variable strings passed to `note(...)`.

| Note | Refs | Files | Pitch class | Octave | Top folders |
| --- | --- | --- | --- | --- | --- |
| `g4` | 958 | 424 | `g` | `4` | `collections/pack-demos` 151, `collections/genres` 115, `collections/jazz-piano` 64 |
| `a4` | 817 | 325 | `a` | `4` | `collections/genres` 129, `collections/jazz-piano` 89, `collections/rim` 73 |
| `d4` | 730 | 356 | `d` | `4` | `collections/genres` 94, `collections/pack-demos` 84, `collections/jazz-piano` 60 |
| `e4` | 728 | 344 | `e` | `4` | `collections/genres` 111, `collections/pack-demos` 67, `collections/rim` 45 |
| `c4` | 715 | 370 | `c` | `4` | `collections/pack-demos` 96, `collections/genres` 71, `collections/jazz-piano` 67 |
| `d5` | 698 | 306 | `d` | `5` | `collections/genres` 112, `collections/jazz-piano` 97, `collections/pack-demos` 75 |
| `c5` | 673 | 298 | `c` | `5` | `collections/pack-demos` 106, `collections/genres` 98, `collections/jazz-piano` 85 |
| `a3` | 581 | 303 | `a` | `3` | `collections/genres` 83, `collections/lofi` 47, `collections/vocals` 39 |
| `b4` | 574 | 241 | `b` | `4` | `collections/genres` 84, `collections/pack-demos` 81, `collections/rim` 81 |
| `e5` | 564 | 243 | `e` | `5` | `collections/genres` 89, `collections/rim` 73, `collections/pack-demos` 60 |
| `f4` | 560 | 258 | `f` | `4` | `collections/pack-demos` 109, `collections/jazz-piano` 83, `collections/genres` 51 |
| `g3` | 536 | 280 | `g` | `3` | `collections/genres` 58, `collections/pack-demos` 48, `collections/lofi` 44 |
| `d3` | 447 | 255 | `d` | `3` | `collections/genres` 52, `collections/lofi` 42, `collections/jazz-piano` 38 |
| `a2` | 437 | 221 | `a` | `2` | `collections/pack-demos` 89, `collections/genres` 49, `collections/harmonic` 34 |
| `g5` | 421 | 215 | `g` | `5` | `collections/jazz-piano` 85, `collections/genres` 59, `collections/pack-demos` 58 |
| `d2` | 414 | 247 | `d` | `2` | `collections/pack-demos` 111, `collections/jazz-piano` 42, `collections/genres` 35 |
| `g2` | 410 | 222 | `g` | `2` | `collections/pack-demos` 46, `collections/genres` 43, `collections/jazz-piano` 41 |
| `a1` | 404 | 170 | `a` | `1` | `collections/pack-demos` 134, `collections/genres` 33, `collections/bone-rattle-gabber` 30 |
| `c3` | 370 | 193 | `c` | `3` | `collections/pack-demos` 45, `collections/lofi` 32, `collections/genres` 30 |
| `c2` | 365 | 239 | `c` | `2` | `collections/pack-demos` 75, `collections/genres` 30, `collections/jazz-piano` 29 |
| `bb4` | 328 | 139 | `bb` | `4` | `collections/jazz-piano` 64, `collections/pack-demos` 58, `collections/genres` 25 |
| `e2` | 325 | 177 | `e` | `2` | `collections/pack-demos` 92, `collections/genres` 57, `collections/jazz-piano` 18 |
| `b3` | 319 | 187 | `b` | `3` | `collections/genres` 59, `collections/lofi` 37, `collections/rim` 31 |
| `a5` | 315 | 159 | `a` | `5` | `collections/genres` 61, `collections/jazz-piano` 51, `collections/pack-demos` 34 |
| `f3` | 312 | 183 | `f` | `3` | `collections/lofi` 36, `collections/genres` 34, `collections/pack-demos` 19 |
| `bb3` | 311 | 176 | `bb` | `3` | `collections/pack-demos` 65, `collections/jazz-piano` 28, `collections/lofi` 27 |
| `eb4` | 281 | 126 | `eb` | `4` | `collections/pack-demos` 76, `collections/jazz-piano` 40, `collections/genres` 26 |
| `e3` | 280 | 171 | `e` | `3` | `collections/lofi` 41, `collections/genres` 31, `collections/harmonic` 27 |
| `f5` | 244 | 135 | `f` | `5` | `collections/jazz-piano` 63, `collections/genres` 38, `collections/pack-demos` 25 |
| `fs4` | 240 | 114 | `fs` | `4` | `collections/bluegrass` 40, `collections/genres` 39, `collections/rim` 33 |
| `f2` | 227 | 149 | `f` | `2` | `collections/genres` 34, `collections/jazz-piano` 31, `collections/pack-demos` 20 |
| `g1` | 211 | 144 | `g` | `1` | `collections/pack-demos` 46, `collections/uk-garage` 27, `collections/genres` 16 |
| `eb5` | 197 | 101 | `eb` | `5` | `collections/pack-demos` 52, `collections/jazz-piano` 40, `collections/genres` 23 |
| `c6` | 195 | 121 | `c` | `6` | `collections/jazz-piano` 42, `collections/genres` 36, `collections/pack-demos` 27 |
| `eb3` | 194 | 96 | `eb` | `3` | `collections/pack-demos` 39, `collections/lofi` 16, `collections/prog` 14 |
| `eb2` | 186 | 126 | `eb` | `2` | `collections/pack-demos` 61, `collections/jazz-piano` 17, `collections/prog` 13 |
| `bb2` | 182 | 111 | `bb` | `2` | `collections/pack-demos` 31, `collections/genres` 19, `collections/lofi` 19 |
| `fs5` | 179 | 87 | `fs` | `5` | `collections/rim` 34, `collections/genres` 28, `collections/bluegrass` 22 |
| `b2` | 160 | 106 | `b` | `2` | `collections/lofi` 27, `collections/genres` 19, `collections/harmonic` 18 |
| `cs5` | 159 | 66 | `cs` | `5` | `collections/rim` 35, `collections/bluegrass` 26, `collections/genres` 25 |
| `ab3` | 158 | 101 | `ab` | `3` | `collections/pack-demos` 42, `collections/jazz-piano` 17, `collections/lofi` 15 |
| `fs3` | 142 | 86 | `fs` | `3` | `collections/genres` 32, `collections/lofi` 24, `collections/rim` 13 |
| `bb1` | 138 | 93 | `bb` | `1` | `collections/pack-demos` 53, `collections/jazz-piano` 14, `collections/genres` 9 |
| `cs4` | 133 | 71 | `cs` | `4` | `collections/genres` 37, `collections/lofi` 19, `collections/rim` 12 |
| `ab4` | 131 | 82 | `ab` | `4` | `collections/pack-demos` 48, `collections/jazz-piano` 27, `collections/genres` 14 |
| `f1` | 130 | 83 | `f` | `1` | `collections/pack-demos` 42, `collections/genres` 17, `collections/finisher` 11 |
| `bb5` | 116 | 69 | `bb` | `5` | `collections/jazz-piano` 44, `collections/pack-demos` 23, `collections/idm` 9 |
| `b5` | 112 | 71 | `b` | `5` | `collections/genres` 28, `collections/jazz-piano` 22, `collections/harmonic` 17 |
| `d6` | 98 | 68 | `d` | `6` | `collections/jazz-piano` 22, `collections/genres` 17, `collections/harmonic` 15 |
| `gs4` | 94 | 43 | `gs` | `4` | `collections/genres` 35, `collections/lofi` 14, `collections/harmonic` 12 |
| `ab1` | 89 | 60 | `ab` | `1` | `collections/pack-demos` 52, `collections/footwork` 5, `collections/bass` 4 |
| `ab2` | 71 | 54 | `ab` | `2` | `collections/pack-demos` 22, `collections/prog` 11, `collections/lofi` 10 |
| `fs2` | 69 | 47 | `fs` | `2` | `collections/idm` 13, `collections/harmonic` 10, `collections/genres` 7 |
| `d1` | 68 | 49 | `d` | `1` | `collections/pack-demos` 18, `collections/bone-rattle-gabber` 11, `collections/genres` 6 |
| `db4` | 67 | 41 | `db` | `4` | `collections/pack-demos` 20, `collections/lofi` 12, `collections/genres` 11 |
| `c1` | 63 | 44 | `c` | `1` | `collections/bone-rattle-gabber` 14, `collections/gardens-of-broken-clocks` 9, `collections/finisher` 8 |
| `e1` | 60 | 46 | `e` | `1` | `collections/genres` 14, `collections/bone-rattle-gabber` 7, `collections/gardens-of-broken-clocks` 6 |
| `e6` | 59 | 45 | `e` | `6` | `collections/genres` 10, `collections/harmonic` 9, `collections/jazz-piano` 8 |
| `eb1` | 57 | 28 | `eb` | `1` | `collections/pack-demos` 42, `collections/bone-rattle-gabber` 6, `collections/uk-garage` 5 |
| `b1` | 55 | 40 | `b` | `1` | `collections/genres` 11, `collections/jazz-piano` 6, `collections/uk-garage` 6 |
| `ab5` | 54 | 23 | `ab` | `5` | `collections/jazz-piano` 24, `collections/genres` 15, `collections/idm` 5 |
| `db3` | 46 | 20 | `db` | `3` | `collections/genres` 13, `collections/lofi` 10, `collections/prog` 7 |
| `cs3` | 43 | 27 | `cs` | `3` | `collections/harmonic` 14, `collections/lofi` 11, `collections/genres` 6 |
| `gs3` | 37 | 26 | `gs` | `3` | `collections/lofi` 11, `collections/berlin-school` 5, `collections/harmonic` 5 |
| `db5` | 28 | 16 | `db` | `5` | `collections/genres` 9, `collections/jazz-piano` 6, `collections/lofi` 5 |
| `g6` | 28 | 16 | `g` | `6` | `collections/genres` 12, `collections/finisher` 4, `collections/game` 3 |
| `fs1` | 24 | 23 | `fs` | `1` | `collections/genres` 8, `collections/hard-bass` 4, `collections/harmonic` 2 |
| `gb4` | 24 | 12 | `gb` | `4` | `collections/jazz-piano` 8, `collections/lofi` 6, `collections/harmonic` 3 |
| `eb6` | 24 | 16 | `eb` | `6` | `collections/genres` 12, `collections/jazz-piano` 7, `collections/finisher` 1 |
| `ds4` | 23 | 17 | `ds` | `4` | `collections/lofi` 7, `collections/jazz-piano` 5, `collections/bluegrass` 2 |
| `gs5` | 23 | 15 | `gs` | `5` | `collections/lofi` 5, `collections/rim` 4, `collections/genres` 3 |
| `a6` | 22 | 15 | `a` | `6` | `collections/game` 4, `collections/gardens-of-broken-clocks` 4, `collections/genres` 4 |
| `gb3` | 19 | 11 | `gb` | `3` | `collections/lofi` 7, `collections/genres` 4, `collections/idm` 2 |
| `f0` | 19 | 10 | `f` | `0` | `collections/underused-palette` 12, `collections/pack-demos` 6, `collections/vocals` 1 |
| `db2` | 18 | 15 | `db` | `2` | `collections/bass` 3, `collections/lofi` 3, `apps/izlase` 2 |
| `cs6` | 18 | 14 | `cs` | `6` | `collections/harmonic` 6, `collections/jazz-piano` 3, `collections/genres` 2 |
| `c7` | 18 | 14 | `c` | `7` | `collections/game` 6, `collections/genres` 4, `collections/yt` 3 |
| `gb2` | 16 | 12 | `gb` | `2` | `collections/lofi` 4, `collections/bone-rattle-gabber` 2, `collections/genres` 2 |
| `g#1` | 15 | 5 | `g#` | `1` | `collections/underused-palette` 14, `collections/genres` 1 |
| `cb3` | 15 | 4 | `cb` | `3` | `collections/underused-palette` 14, `collections/lofi` 1 |
| `ds5` | 14 | 6 | `ds` | `5` | `collections/lofi` 7, `collections/jazz-piano` 4, `collections/bluegrass` 2 |
| `d7` | 14 | 8 | `d` | `7` | `collections/underused-palette` 8, `collections/gardens-of-broken-clocks` 2, `collections/genres` 2 |
| `db6` | 14 | 6 | `db` | `6` | `collections/underused-palette` 8, `collections/genres` 2, `collections/jazz-piano` 2 |
| `as4` | 14 | 4 | `as` | `4` | `collections/underused-palette` 10, `collections/jazz-piano` 2, `collections/lofi` 2 |
| `gb1` | 13 | 7 | `gb` | `1` | `collections/underused-palette` 8, `collections/bass` 1, `collections/bone-rattle-gabber` 1 |
| `fs6` | 13 | 11 | `fs` | `6` | `collections/harmonic` 6, `collections/gardens-of-broken-clocks` 2, `collections/vocals` 2 |
| `ab6` | 13 | 4 | `ab` | `6` | `collections/underused-palette` 9, `collections/genres` 4 |
| `bb0` | 13 | 7 | `bb` | `0` | `collections/pack-demos` 12, `collections/genres` 1 |
| `b6` | 12 | 8 | `b` | `6` | `collections/underused-palette` 6, `collections/gardens-of-broken-clocks` 2, `collections/game` 1 |
| `f7` | 12 | 4 | `f` | `7` | `collections/underused-palette` 10, `collections/game` 1, `collections/jazz-piano` 1 |
| `d#4` | 12 | 4 | `d#` | `4` | `collections/underused-palette` 10, `collections/genres` 1, `collections/jazz-piano` 1 |
| `cs7` | 12 | 5 | `cs` | `7` | `collections/underused-palette` 8, `collections/genres` 2, `collections/harmonic` 2 |
| `c8` | 11 | 4 | `c` | `8` | `collections/underused-palette` 8, `collections/yt` 2, `collections/game` 1 |
| `g7` | 11 | 6 | `g` | `7` | `collections/underused-palette` 5, `collections/yt` 5, `collections/game` 1 |
| `f6` | 11 | 10 | `f` | `6` | `collections/genres` 4, `collections/game` 3, `collections/jazz-piano` 2 |
| `b0` | 11 | 5 | `b` | `0` | `collections/underused-palette` 8, `collections/genres` 2, `collections/vocals` 1 |
| `d#6` | 11 | 4 | `d#` | `6` | `collections/underused-palette` 9, `collections/genres` 1, `collections/jazz-piano` 1 |
| `c#3` | 11 | 4 | `c#` | `3` | `collections/underused-palette` 9, `collections/genres` 2 |
| `g#5` | 11 | 5 | `g#` | `5` | `collections/genres` 8, `collections/jazz-piano` 3 |
| `g#3` | 11 | 4 | `g#` | `3` | `collections/underused-palette` 9, `collections/genres` 2 |
| `gs6` | 11 | 4 | `gs` | `6` | `collections/underused-palette` 9, `collections/genres` 1, `collections/harmonic` 1 |
| `cb4` | 11 | 3 | `cb` | `4` | `collections/underused-palette` 8, `collections/lofi` 3 |
| `as5` | 11 | 3 | `as` | `5` | `collections/underused-palette` 10, `collections/lofi` 1 |
| `f#2` | 11 | 3 | `f#` | `2` | `collections/underused-palette` 10, `collections/prog` 1 |
| `d8` | 11 | 3 | `d` | `8` | `collections/underused-palette` 10, `collections/yt` 1 |
| `ab0` | 10 | 10 | `ab` | `0` | `collections/pack-demos` 9, `collections/genres` 1 |
| `f#4` | 10 | 5 | `f#` | `4` | `collections/genres` 7, `collections/jazz-piano` 2, `collections/prog` 1 |
| `f#6` | 10 | 3 | `f#` | `6` | `collections/underused-palette` 9, `collections/genres` 1 |
| `d#5` | 10 | 4 | `d#` | `5` | `collections/underused-palette` 5, `collections/jazz-piano` 3, `collections/genres` 2 |
| `gb5` | 10 | 4 | `gb` | `5` | `collections/idm` 4, `collections/underused-palette` 4, `collections/genres` 1 |
| `db7` | 10 | 3 | `db` | `7` | `collections/underused-palette` 9, `collections/genres` 1 |
| `c#5` | 10 | 4 | `c#` | `5` | `collections/underused-palette` 8, `collections/genres` 2 |
| `d#2` | 10 | 3 | `d#` | `2` | `collections/underused-palette` 9, `collections/genres` 1 |
| `gs2` | 10 | 6 | `gs` | `2` | `collections/underused-palette` 5, `collections/harmonic` 3, `collections/lofi` 2 |
| `a8` | 10 | 3 | `a` | `8` | `collections/underused-palette` 9, `collections/yt` 1 |
| `b7` | 10 | 3 | `b` | `7` | `collections/underused-palette` 9, `collections/yt` 1 |
| `cb5` | 9 | 3 | `cb` | `5` | `collections/underused-palette` 5, `apps/izlase` 2, `collections/jazz-piano` 2 |
| `e7` | 9 | 8 | `e` | `7` | `collections/yt` 4, `collections/game` 3, `collections/genres` 1 |
| `a0` | 9 | 7 | `a` | `0` | `collections/pack-demos` 6, `collections/genres` 3 |
| `c#4` | 9 | 5 | `c#` | `4` | `collections/underused-palette` 5, `collections/genres` 3, `collections/hard-bass` 1 |
| `f#3` | 9 | 3 | `f#` | `3` | `collections/underused-palette` 8, `collections/genres` 1 |
| `ds6` | 9 | 3 | `ds` | `6` | `collections/underused-palette` 8, `collections/harmonic` 1 |
| `eb7` | 9 | 3 | `eb` | `7` | `collections/underused-palette` 8, `collections/jazz-piano` 1 |
| `db1` | 9 | 9 | `db` | `1` | `collections/pack-demos` 9 |
| `e8` | 9 | 3 | `e` | `8` | `collections/underused-palette` 8, `collections/yt` 1 |
| `cs2` | 8 | 5 | `cs` | `2` | `collections/underused-palette` 4, `collections/amapiano` 1, `collections/berlin-school` 1 |
| `ds3` | 8 | 5 | `ds` | `3` | `collections/underused-palette` 4, `collections/harmonic` 2, `collections/footwork` 1 |
| `a7` | 8 | 4 | `a` | `7` | `collections/underused-palette` 5, `collections/yt` 2, `collections/game` 1 |
| `bb6` | 8 | 4 | `bb` | `6` | `collections/underused-palette` 4, `collections/jazz-piano` 2, `collections/gardens-of-broken-clocks` 1 |
| `g0` | 8 | 4 | `g` | `0` | `collections/underused-palette` 5, `collections/genres` 3 |
| `f#5` | 8 | 4 | `f#` | `5` | `collections/underused-palette` 5, `collections/genres` 2, `collections/prog` 1 |
| `c#6` | 8 | 4 | `c#` | `6` | `collections/underused-palette` 4, `collections/jazz-piano` 3, `collections/genres` 1 |
| `d0` | 8 | 3 | `d` | `0` | `collections/underused-palette` 7, `collections/vocals` 1 |
| `fs0` | 7 | 3 | `fs` | `0` | `collections/underused-palette` 4, `collections/genres` 2, `collections/vocals` 1 |
| `cs1` | 7 | 4 | `cs` | `1` | `collections/underused-palette` 4, `collections/genres` 1, `collections/harmonic` 1 |
| `c#2` | 6 | 2 | `c#` | `2` | `collections/underused-palette` 5, `collections/genres` 1 |
| `as3` | 6 | 3 | `as` | `3` | `collections/underused-palette` 4, `collections/jazz-piano` 1, `collections/study` 1 |
| `gb6` | 1 | 1 | `gb` | `6` | `collections/genres` 1 |
| `g#2` | 1 | 1 | `g#` | `2` | `collections/genres` 1 |
| `g#4` | 1 | 1 | `g#` | `4` | `collections/genres` 1 |
| `gs1` | 1 | 1 | `gs` | `1` | `collections/jazz-piano` 1 |

## Pitch Class Distribution

| Pitch class | Refs |
| --- | --- |
| `a` | 2603 |
| `g` | 2583 |
| `d` | 2488 |
| `c` | 2410 |
| `e` | 2034 |
| `f` | 1515 |
| `b` | 1253 |
| `bb` | 1096 |
| `eb` | 948 |
| `fs` | 674 |
| `ab` | 526 |
| `cs` | 380 |
| `db` | 192 |
| `gs` | 176 |
| `gb` | 83 |
| `ds` | 54 |
| `f#` | 48 |
| `c#` | 44 |
| `d#` | 43 |
| `g#` | 39 |
| `cb` | 35 |
| `as` | 31 |

## Octave Distribution

| Octave | Refs |
| --- | --- |
| `0` | 85 |
| `1` | 1344 |
| `2` | 2926 |
| `3` | 3855 |
| `4` | 6460 |
| `5` | 3866 |
| `6` | 565 |
| `7` | 113 |
| `8` | 41 |

## Numeric Note Tokens In `note()`

These are numeric tokens inside `note(...)`. In this repo they are usually scale degrees when followed by `.scale(...)`; a few lesson examples use MIDI-style values such as `60 62 64`.

| Numeric note | Refs | Files | Top folders |
| --- | --- | --- | --- |
| `0` | 28 | 8 | `collections/hard-bass` 12, `collections/finisher` 7, `collections/study` 6 |
| `5` | 19 | 7 | `collections/hard-bass` 7, `collections/finisher` 6, `collections/study` 4 |
| `7` | 19 | 7 | `collections/hard-bass` 9, `collections/finisher` 5, `collections/vocals` 3 |
| `2` | 13 | 5 | `collections/study` 5, `collections/vocals` 4, `collections/finisher` 2 |
| `3` | 11 | 6 | `collections/finisher` 4, `collections/hard-bass` 4, `collections/study` 2 |
| `4` | 9 | 3 | `collections/study` 5, `collections/vocals` 4 |
| `6` | 4 | 2 | `collections/study` 2, `collections/vocals` 2 |
| `1` | 4 | 2 | `collections/study` 3, `courses/Skola` 1 |
| `62` | 2 | 1 | `courses/Skola` 2 |
| `64` | 2 | 1 | `courses/Skola` 2 |
| `65` | 2 | 1 | `courses/Skola` 2 |
| `-1` | 1 | 1 | `collections/study` 1 |
| `-2` | 1 | 1 | `collections/study` 1 |
| `8` | 1 | 1 | `collections/study` 1 |
| `9` | 1 | 1 | `collections/vocals` 1 |
| `60` | 1 | 1 | `courses/Skola` 1 |
| `67` | 1 | 1 | `courses/Skola` 1 |

## Scale Degrees In `n()`

| Degree token | Refs | Files | Top folders |
| --- | --- | --- | --- |
| `2` | 29 | 16 | `collections/acid` 13, `collections/similarity-gradient` 10, `courses/Skola` 6 |
| `0` | 24 | 17 | `collections/similarity-gradient` 11, `collections/acid` 7, `courses/Skola` 6 |
| `4` | 19 | 12 | `collections/similarity-gradient` 12, `courses/Skola` 4, `collections/acid` 3 |
| `5` | 17 | 9 | `collections/acid` 10, `collections/similarity-gradient` 4, `courses/Skola` 3 |
| `3` | 15 | 9 | `collections/acid` 9, `courses/Skola` 5, `collections/similarity-gradient` 1 |
| `7` | 15 | 11 | `collections/acid` 8, `collections/similarity-gradient` 5, `courses/Skola` 2 |
| `6` | 9 | 7 | `collections/similarity-gradient` 6, `collections/acid` 2, `courses/Skola` 1 |
| `10` | 4 | 2 | `collections/acid` 4 |
| `8` | 3 | 2 | `collections/acid` 2, `collections/similarity-gradient` 1 |
| `12` | 3 | 2 | `collections/acid` 3 |
| `9` | 2 | 1 | `collections/acid` 2 |
| `14` | 1 | 1 | `collections/acid` 1 |
| `11` | 1 | 1 | `collections/similarity-gradient` 1 |
| `1` | 1 | 1 | `courses/Skola` 1 |

## Frequent Chord Stacks

Top chord stacks found inside square-bracket note groups. This is intentionally capped at 160 rows because the complete set is very broad.

| Chord stack | Refs | Files |
| --- | --- | --- |
| `[a3,c4,e4,g4]` | 53 | 49 |
| `[a3,c4,e4]` | 52 | 44 |
| `[g3,b3,d4]` | 39 | 33 |
| `[c4,e4,g4]` | 37 | 36 |
| `[d4,f4,a4,c5]` | 36 | 32 |
| `[ab3,c4,eb4,g4]` | 33 | 30 |
| `[g3,bb3,d4,f4]` | 31 | 24 |
| `[d4,f4,a4]` | 30 | 25 |
| `[bb3,d4,f4,a4]` | 29 | 21 |
| `[c4,eb4,g4,bb4]` | 28 | 28 |
| `[g4,b4,d5]` | 27 | 27 |
| `[d3,g3,c4,f4,a4]` | 27 | 2 |
| `[d4,fs4,a4]` | 26 | 22 |
| `[c4,e4,g4,b4]` | 26 | 23 |
| `[f3,a3,c4]` | 25 | 25 |
| `[e3,g3,b3,d4]` | 25 | 23 |
| `[d3,f3,a3,c4]` | 24 | 22 |
| `[e4,g4,b4]` | 24 | 23 |
| `[eb4,g4,bb4,d5]` | 23 | 21 |
| `[a3,cs4,e4]` | 23 | 19 |
| `[g3,b3,d4,f4]` | 23 | 23 |
| `[a3,c4,e4,g4,b4]` | 22 | 22 |
| `[g3,bb3,d4]` | 20 | 18 |
| `[d3,f3,a3,c4,e4]` | 20 | 19 |
| `[f3,a3,c4,e4]` | 20 | 16 |
| `[c3,eb3,g3,bb3,d4]` | 20 | 19 |
| `[e3,g3,b3]` | 20 | 20 |
| `[bb3,d4,f4]` | 20 | 17 |
| `[d3,fs3,a3]` | 18 | 17 |
| `[eb3,g3,bb3,d4,f4]` | 18 | 18 |
| `[eb4,g4,bb4]` | 18 | 15 |
| `[bb3,d4,f4,ab4]` | 17 | 16 |
| `[c3,eb3,g3,bb3]` | 17 | 15 |
| `[b3,d4,fs4,a4]` | 17 | 16 |
| `[a4,c5,e5,a5]` | 16 | 16 |
| `[d5,f5,a5,d6]` | 15 | 15 |
| `[c5,e5,g5,c6]` | 15 | 15 |
| `[e4,g4,b4,e5]` | 15 | 15 |
| `[c3,eb3,g3]` | 14 | 12 |
| `[d3,f3,a3]` | 14 | 13 |
| `[ab2,c3,eb3,g3,bb3]` | 14 | 14 |
| `[f3,ab3,c4,eb4]` | 14 | 12 |
| `[bb2,d3,f3,ab3,c4]` | 14 | 14 |
| `[f3,a3,c4,eb4]` | 13 | 11 |
| `[eb5,g5,bb5]` | 13 | 13 |
| `[c5,eb5,g5]` | 13 | 13 |
| `[ab4,c5,eb5]` | 13 | 13 |
| `[ab3,c4,eb4]` | 13 | 13 |
| `[b3,d4,fs4]` | 12 | 11 |
| `[f3,ab3,c4,eb4,g4]` | 12 | 12 |
| `[c3,e3,g3]` | 12 | 11 |
| `[g2,b2,d3]` | 11 | 11 |
| `[c3,e3,g3,b3]` | 11 | 11 |
| `[fs3,a3,cs4,e4]` | 11 | 11 |
| `[f4,ab4,c5,g5]` | 11 | 11 |
| `[bb3,db4,f4,c5]` | 11 | 11 |
| `[eb4,g4,bb4,f5]` | 11 | 11 |
| `[ab3,c4,eb4,bb4]` | 11 | 11 |
| `[eb3,g3,bb3,d4]` | 10 | 9 |
| `[fs3,a3,cs4]` | 10 | 10 |
| `[db4,f4,ab4]` | 10 | 10 |
| `[eb3,g3,bb3]` | 9 | 8 |
| `[e3,gs3,b3]` | 9 | 9 |
| `[e4,g4,b4,d5]` | 9 | 7 |
| `[e3,g3,b3,d4,fs4]` | 9 | 9 |
| `[f4,a4,c5]` | 9 | 8 |
| `[a2,cs3,e3]` | 9 | 8 |
| `[eb3,ab3,db4,gb4,bb4]` | 9 | 2 |
| `[f4,ab4,c5]` | 9 | 9 |
| `[a2,c3,e3]` | 8 | 8 |
| `[bb2,d3,f3]` | 8 | 8 |
| `[f3,a3,c4,e4,g4]` | 8 | 8 |
| `[bb2,d3,f3,a3,c4]` | 8 | 8 |
| `[f2,a2,c3]` | 7 | 6 |
| `[ab2,c3,eb3]` | 7 | 6 |
| `[g4,bb4,d5,f5]` | 7 | 4 |
| `[fs3,a3,cs4,e4,gs4]` | 7 | 7 |
| `[c4,eb4,g4]` | 7 | 7 |
| `[e4,gs4,b4]` | 7 | 5 |
| `[d3,fs3,a3,c4]` | 7 | 7 |
| `[g3,b3,d4,fs4]` | 7 | 7 |
| `[a2,c3,e3,g3]` | 7 | 7 |
| `[a4,c5,e5]` | 7 | 6 |
| `[d4,f4,a4,c5,e5]` | 6 | 5 |
| `[d3,fs3,a3,cs4,e4]` | 6 | 6 |
| `[c5,e5,g5]` | 6 | 5 |
| `[a3,cs4,e4,g4]` | 6 | 5 |
| `[a3,cs4,e4,gs4]` | 6 | 6 |
| `[e2,bb2]` | 6 | 1 |
| `[d4,f4,bb4]` | 6 | 6 |
| `[f4,a4,c5,e5]` | 6 | 4 |
| `[bb2,d3,f3,a3]` | 5 | 5 |
| `[e2,g2,b2]` | 5 | 5 |
| `[eb4,g4]` | 5 | 5 |
| `[c4,e4,g4,b4,d5]` | 5 | 5 |
| `[g2,bb2,d3]` | 5 | 5 |
| `[fs4,a4,cs5,e5]` | 5 | 5 |
| `[b2,d3,fs3]` | 5 | 5 |
| `[g3,bb3,d4,f4,a4]` | 5 | 5 |
| `[b3,ds4,fs4]` | 5 | 5 |
| `[db3,f3,ab3,c4]` | 5 | 5 |
| `[cs4,e4,gs4,b4]` | 5 | 5 |
| `[bb3,db4,f4,ab4]` | 5 | 5 |
| `[g3,b3,d4,g4]` | 5 | 3 |
| `[a3,c4,f4]` | 5 | 4 |
| `[d2,fs2,a2]` | 5 | 5 |
| `[b4,e5]` | 5 | 4 |
| `[d4,g4,b4]` | 5 | 5 |
| `[g2,d3]` | 5 | 5 |
| `[f3,ab3,c4]` | 4 | 3 |
| `[a4,d5]` | 4 | 4 |
| `[c3,f3,g3,bb3]` | 4 | 4 |
| `[b2,d3,fs3,a3]` | 4 | 4 |
| `[d4,fs4,a4,cs5]` | 4 | 4 |
| `[f2,a2,c3,e3]` | 4 | 4 |
| `[bb2,db3,f3,ab3,c4]` | 4 | 4 |
| `[gb3,bb3,db4,f4]` | 4 | 4 |
| `[e3,g3,b3,d4,f4]` | 4 | 2 |
| `[a3,c4,eb4,g4]` | 4 | 3 |
| `[a4,cs5,e5]` | 4 | 4 |
| `[c4,e4,g4,c5]` | 4 | 4 |
| `[e4,g4,c5]` | 4 | 4 |
| `[fs2,a2,cs3]` | 4 | 4 |
| `[cs4,e4,a4]` | 4 | 4 |
| `[e4,a4,c5]` | 4 | 4 |
| `[b3,d4,f4]` | 4 | 1 |
| `[a3,c4,eb4]` | 4 | 1 |
| `[eb3,g3,bb3,db4]` | 4 | 4 |
| `[f4,a4]` | 3 | 3 |
| `[g3,b3,d4,fs4,a4]` | 3 | 3 |
| `[c4,eb4,g4,bb4,d5]` | 3 | 3 |
| `[b2,d3,fs3,a3,cs4]` | 3 | 3 |
| `[a2,d3,e3,g3]` | 3 | 3 |
| `[e3,a3,b3,d4]` | 3 | 3 |
| `[cs3,e3,gs3]` | 3 | 3 |
| `[bb2,db3,f3]` | 3 | 3 |
| `[c3,e3,g3,bb3]` | 3 | 3 |
| `[c5,e5,a5]` | 3 | 3 |
| `[a4,c5,f5]` | 3 | 3 |
| `[g2,b2,d3,f3]` | 3 | 3 |
| `[db3,f3,ab3,c4,eb4]` | 3 | 3 |
| `[a4,cs5,e5,gs5]` | 3 | 3 |
| `[a2,cs3,e3,fs3,a3]` | 3 | 3 |
| `[bb4,d5,f5]` | 3 | 3 |
| `[d3,fs3,a3,cs4]` | 3 | 3 |
| `[e4,gs4,b4,d5]` | 3 | 3 |
| `[fs4,a4,cs5]` | 3 | 2 |
| `[f3,c4]` | 3 | 3 |
| `[d3,fs3,a3,d4]` | 3 | 2 |
| `[b4,d5,g5]` | 3 | 3 |
| `[g4,bb4,d5]` | 3 | 3 |
| `[g4,c5,e5]` | 3 | 3 |
| `[cs4,e4,gs4]` | 3 | 3 |
| `[c2,e2,g2]` | 3 | 3 |
| `[b3,d4,g4]` | 3 | 3 |
| `[c5,f5,a5]` | 3 | 2 |
| `[b3,e4,g4]` | 3 | 3 |
| `[c4,e4,a4]` | 3 | 3 |
| `[e3,gs3,b3,ds4]` | 3 | 3 |
| `[b3,ds4,fs4,a4]` | 3 | 3 |

## External Sample Packs

| Pack | Loads | Files | Example files |
| --- | --- | --- | --- |
| `github:felixroos/dough-samples` | 17 | 17 | `apps/izlase/03-mridangam-misra.strudel`, `collections/finisher/15-sample-pack-postcard.strudel`, +15 more |
| `github:yaxu/clean-breaks` | 5 | 5 | `collections/finisher/34-dnb-clean-break-memory.strudel`, `collections/pack-demos/clean-breaks-1-dnb.strudel`, +3 more |
| `github:Bubobubobubobubo/Dough-Amen` | 5 | 5 | `collections/finisher/35-amens-under-glass.strudel`, `collections/pack-demos/amen-1-dnb.strudel`, +3 more |
| `github:Bubobubobubobubo/Dough-Amiga` | 3 | 3 | `collections/pack-demos/amiga-1-chiptune.strudel`, `collections/pack-demos/amiga-2-idm.strudel`, +1 more |
| `github:tidalcycles/Dirt-Samples` | 3 | 3 | `collections/pack-demos/dirt-1-boom_bap.strudel`, `collections/pack-demos/dirt-2-techno.strudel`, +1 more |
| `github:geikha/tidal-drum-machines` | 3 | 3 | `collections/pack-demos/tidal-drums-1-techno.strudel`, `collections/pack-demos/tidal-drums-2-house.strudel`, +1 more |
| `github:algorave-dave/samples` | 2 | 2 | `collections/pack-demos/algorave-dave-1-acid.strudel`, `collections/pack-demos/algorave-dave-2-techno.strudel` |
| `github:AuditeMarlow/samples` | 2 | 2 | `collections/pack-demos/audite-1-ambient.strudel`, `collections/pack-demos/audite-2-idm.strudel` |
| `github:bratpeki/sample-packs` | 2 | 2 | `collections/pack-demos/bratpeki-1-dnb.strudel`, `collections/pack-demos/bratpeki-2-trap.strudel` |
| `github:Bubobubobubobubo/Dough-Samples` | 2 | 2 | `collections/pack-demos/bubo-samples-1-techno.strudel`, `collections/pack-demos/bubo-samples-2-ambient.strudel` |
| `github:salsicha/capoeira_strudel` | 2 | 2 | `collections/pack-demos/capoeira-1-ethnic.strudel`, `collections/pack-demos/capoeira-2-ambient.strudel` |
| `github:hvillase/cavlp-25p` | 2 | 2 | `collections/pack-demos/cavlp-1-idm.strudel`, `collections/pack-demos/cavlp-2-techno.strudel` |
| `github:eddyflux/crate` | 2 | 2 | `collections/pack-demos/crate-1-boom_bap.strudel`, `collections/pack-demos/crate-2-trap.strudel` |
| `github:danigb/samples` | 2 | 2 | `collections/pack-demos/danigb-1-pop.strudel`, `collections/pack-demos/danigb-2-techno.strudel` |
| `github:prismograph/departure` | 2 | 2 | `collections/pack-demos/departure-1-ambient.strudel`, `collections/pack-demos/departure-2-idm.strudel` |
| `github:EloMorelo/samples` | 2 | 2 | `collections/pack-demos/elomorelo-1-pop.strudel`, `collections/pack-demos/elomorelo-2-house.strudel` |
| `github:emptyflash/samples` | 2 | 2 | `collections/pack-demos/emptyflash-1-house.strudel`, `collections/pack-demos/emptyflash-2-trap.strudel` |
| `github:emrexdeger/strudelSamples` | 2 | 2 | `collections/pack-demos/emrex-1-techno.strudel`, `collections/pack-demos/emrex-2-dnb.strudel` |
| `github:felixroos/estuary-samples` | 2 | 2 | `collections/pack-demos/estuary-1-ambient.strudel`, `collections/pack-demos/estuary-2-lofi.strudel` |
| `github:felixroos/samples` | 2 | 2 | `collections/pack-demos/felixroos-1-lofi.strudel`, `collections/pack-demos/felixroos-2-pop.strudel` |
| `github:fjpolo/fjpolo-Strudel` | 2 | 2 | `collections/pack-demos/fjpolo-1-lofi.strudel`, `collections/pack-demos/fjpolo-2-ambient.strudel` |
| `github:Bubobubobubobubo/Dough-Fox` | 2 | 2 | `collections/pack-demos/fox-1-chiptune.strudel`, `collections/pack-demos/fox-2-pop.strudel` |
| `github:Boochi44/free-drum-samples` | 2 | 2 | `collections/pack-demos/free-drums-1-trap.strudel`, `collections/pack-demos/free-drums-2-boom_bap.strudel` |
| `github:mot4i/garden` | 2 | 2 | `collections/pack-demos/garden-1-ambient.strudel`, `collections/pack-demos/garden-2-lofi.strudel` |
| `github:Veikkosuhonen/graffathon25-demo` | 2 | 2 | `collections/pack-demos/graffathon-1-chiptune.strudel`, `collections/pack-demos/graffathon-2-techno.strudel` |
| `github:gregharvey/drum-samples` | 2 | 2 | `collections/pack-demos/greg-drums-1-house.strudel`, `collections/pack-demos/greg-drums-2-techno.strudel` |
| `github:Bubobubobubobubo/Dough-Juj` | 2 | 2 | `collections/pack-demos/juj-1-idm.strudel`, `collections/pack-demos/juj-2-trap.strudel` |
| `github:k09/samples` | 2 | 2 | `collections/pack-demos/k09-1-acid.strudel`, `collections/pack-demos/k09-2-house.strudel` |
| `github:kaiye10/strudelSamples` | 2 | 2 | `collections/pack-demos/kaiye10-1-trap.strudel`, `collections/pack-demos/kaiye10-2-lofi.strudel` |
| `github:TristanCacqueray/mirus` | 2 | 2 | `collections/pack-demos/mirus-1-ambient.strudel`, `collections/pack-demos/mirus-2-acid.strudel` |
| `github:AustinOliverHaskell/ms-teams-sounds-strudel` | 2 | 2 | `collections/pack-demos/ms-teams-1-pop.strudel`, `collections/pack-demos/ms-teams-2-idm.strudel` |
| `github:mysinglelise/msl-strudel-samples` | 2 | 2 | `collections/pack-demos/msl-1-lofi.strudel`, `collections/pack-demos/msl-2-house.strudel` |
| `github:Nikeryms/Samples` | 2 | 2 | `collections/pack-demos/nikeryms-1-techno.strudel`, `collections/pack-demos/nikeryms-2-trap.strudel` |
| `github:patchbanks/WaivOps-HH-LFBB` | 2 | 2 | `collections/pack-demos/patch-hh-1-boom_bap.strudel`, `collections/pack-demos/patch-hh-2-trap.strudel` |
| `github:patchbanks/Lo-Fi-Drums-Dataset` | 2 | 2 | `collections/pack-demos/patch-lofi-1-lofi.strudel`, `collections/pack-demos/patch-lofi-2-boom_bap.strudel` |
| `github:patchbanks/WaivOps-EDM-TECH` | 2 | 2 | `collections/pack-demos/patch-techno-1-techno.strudel`, `collections/pack-demos/patch-techno-2-acid.strudel` |
| `github:fstiffo/polifonia-samples` | 2 | 2 | `collections/pack-demos/polifonia-1-ambient.strudel`, `collections/pack-demos/polifonia-2-pop.strudel` |
| `github:QuantumVillage/quantum-music` | 2 | 2 | `collections/pack-demos/quantum-1-acid.strudel`, `collections/pack-demos/quantum-2-idm.strudel` |
| `github:RikyBac15/samples` | 2 | 2 | `collections/pack-demos/rikybac15-1-pop.strudel`, `collections/pack-demos/rikybac15-2-boom_bap.strudel` |
| `github:sonidosingapura/rochormatic` | 2 | 2 | `collections/pack-demos/rochormatic-1-idm.strudel`, `collections/pack-demos/rochormatic-2-ambient.strudel` |
| `github:yaxu/spicule` | 2 | 2 | `collections/pack-demos/spicule-1-idm.strudel`, `collections/pack-demos/spicule-2-techno.strudel` |
| `github:daslyfe/StrudelDirt` | 2 | 2 | `collections/pack-demos/strudeldirt-1-boom_bap.strudel`, `collections/pack-demos/strudeldirt-2-dnb.strudel` |
| `github:terrorhank/samples` | 2 | 2 | `collections/pack-demos/terrorhank-1-techno.strudel`, `collections/pack-demos/terrorhank-2-dnb.strudel` |
| `github:tesspilot/samples` | 2 | 2 | `collections/pack-demos/tesspilot-1-trap.strudel`, `collections/pack-demos/tesspilot-2-house.strudel` |
| `github:TodePond/samples` | 2 | 2 | `collections/pack-demos/todepond-1-idm.strudel`, `collections/pack-demos/todepond-2-ambient.strudel` |
| `github:jonathanmc/audio` | 2 | 2 | `collections/pack-demos/tr909-1-house.strudel`, `collections/pack-demos/tr909-2-techno.strudel` |
| `github:vasilymilovidov/samples` | 2 | 2 | `collections/pack-demos/vasily-1-lofi.strudel`, `collections/pack-demos/vasily-2-house.strudel` |
| `github:sgossner/VCSL` | 2 | 2 | `collections/pack-demos/vcsl-1-pop.strudel`, `collections/pack-demos/vcsl-2-ambient.strudel` |
| `github:Bubobubobubobubo/Dough-Waveforms` | 2 | 2 | `collections/pack-demos/waveforms-1-acid.strudel`, `collections/pack-demos/waveforms-2-ambient.strudel` |
| `github:wyan/livecoding-samples` | 2 | 2 | `collections/pack-demos/wyan-1-pop.strudel`, `collections/pack-demos/wyan-2-house.strudel` |

## Folder Fingerprints

| Area | Files | `s()` refs | Synth refs | Pitch refs | `n()` refs | Top sounds | Top notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `apps/izlase` | 5 | 33 | 14 | 192 | 0 | `bd` 10, `hh` 10, `sawtooth` 7, `sd` 6, `triangle` 4, `lt` 4, `piano` 3, `oh` 2 | `bb3` 10, `eb4` 9, `g4` 9, `d5` 9, `d4` 9, `f4` 9, `bb4` 8, `a4` 8 |
| `collections/acid` | 5 | 117 | 32 | 217 | 64 | `hh` 67, `sawtooth` 22, `bd` 20, `oh` 12, `cp` 6, `sine` 6, `sd` 6, `square` 4 | `g2` 12, `c3` 12, `d3` 10, `eb3` 10, `a2` 9, `b2` 9, `g3` 8, `c2` 7 |
| `collections/amapiano` | 20 | 356 | 77 | 543 | 0 | `hh` 250, `rim` 48, `bd` 44, `sine` 42, `triangle` 18, `sawtooth` 17, `cp` 14 | `c4` 29, `a3` 28, `c5` 22, `d5` 21, `c2` 20, `d4` 20, `g4` 19, `d2` 19 |
| `collections/bass` | 12 | 185 | 23 | 94 | 0 | `hh` 125, `bd` 34, `cp` 13, `sine` 12, `rim` 8, `sd` 5, `square` 4, `triangle` 4 | `c2` 13, `d2` 8, `a1` 7, `g1` 6, `f1` 6, `g2` 5, `f2` 5, `ab1` 4 |
| `collections/berlin-school` | 20 | 67 | 97 | 489 | 0 | `sawtooth` 63, `bd` 35, `hh` 30, `sine` 20, `triangle` 9, `square` 5, `sd` 2 | `c4` 27, `a3` 24, `e4` 23, `g4` 21, `g3` 19, `d4` 19, `a1` 16, `f3` 15 |
| `collections/bluegrass` | 15 | 56 | 64 | 676 | 0 | `sawtooth` 36, `bd` 26, `sd` 24, `sine` 15, `triangle` 13, `cp` 4, `hh` 2 | `a4` 57, `d4` 51, `b4` 47, `g4` 44, `fs4` 40, `d5` 40, `e4` 39, `e5` 35 |
| `collections/bone-rattle-gabber` | 20 | 424 | 39 | 168 | 0 | `hh` 240, `bd` 77, `metal` 52, `white` 32, `sine` 20, `cp` 16, `sawtooth` 16, `oh` 4 | `a1` 30, `a3` 15, `c4` 14, `c1` 14, `d1` 11, `a4` 8, `f1` 7, `e1` 7 |
| `collections/finisher` | 40 | 580 | 105 | 715 | 0 | `hh` 332, `white` 92, `bd` 82, `sawtooth` 42, `sine` 30, `triangle` 25, `sd` 23, `rim` 22 | `g4` 37, `d4` 37, `a4` 35, `e4` 35, `a3` 32, `c4` 30, `g3` 28, `a1` 28 |
| `collections/footwork` | 20 | 589 | 54 | 393 | 0 | `hh` 434, `bd` 108, `cp` 32, `sine` 30, `sawtooth` 19, `rim` 11, `triangle` 5, `oh` 2 | `c2` 26, `a1` 21, `d2` 18, `a4` 18, `g3` 17, `c5` 17, `d4` 16, `g1` 15 |
| `collections/game` | 20 | 80 | 37 | 169 | 0 | `hh` 44, `white` 21, `square` 12, `triangle` 10, `sawtooth` 10, `bd` 7, `sine` 5, `lt` 4 | `c6` 14, `e5` 13, `g5` 12, `c5` 9, `e4` 9, `a5` 8, `c3` 8, `a4` 7 |
| `collections/gardens-of-broken-clocks` | 30 | 181 | 98 | 394 | 0 | `white` 99, `rim` 39, `sine` 37, `sawtooth` 34, `triangle` 27, `hh` 24, `bd` 18, `cy` 1 | `e4` 24, `a3` 23, `c4` 21, `g3` 20, `b4` 16, `g4` 14, `a5` 14, `d4` 13 |
| `collections/genres` | 50 | 1123 | 229 | 2475 | 0 | `hh` 731, `sawtooth` 134, `bd` 120, `sd` 86, `triangle` 48, `white` 44, `sine` 43, `oh` 32 | `a4` 129, `g4` 115, `d5` 112, `e4` 111, `c5` 98, `d4` 94, `e5` 89, `b4` 84 |
| `collections/hard-bass` | 20 | 582 | 65 | 181 | 0 | `hh` 319, `bd` 80, `white` 72, `sawtooth` 42, `cp` 33, `oh` 26, `rim` 23, `sine` 18 | `a1` 18, `g1` 11, `a3` 9, `a4` 9, `d2` 8, `g3` 8, `e4` 7, `d4` 7 |
| `collections/harmonic` | 30 | 171 | 154 | 956 | 0 | `white` 128, `sawtooth` 90, `triangle` 33, `hh` 32, `sine` 31, `bd` 11 | `g4` 46, `b4` 45, `d5` 38, `e4` 38, `e5` 34, `a2` 34, `a5` 33, `a4` 33 |
| `collections/idm` | 20 | 265 | 61 | 428 | 0 | `hh` 143, `bd` 61, `sawtooth` 33, `white` 26, `sd` 20, `cp` 13, `triangle` 12, `square` 9 | `c5` 20, `a4` 18, `g5` 17, `d5` 16, `e5` 15, `eb5` 15, `d2` 14, `g4` 13 |
| `collections/jazz-piano` | 20 | 0 | 61 | 1825 | 0 | `piano` 61 | `d5` 97, `a4` 89, `c5` 85, `g5` 85, `f4` 83, `c4` 67, `g4` 64, `bb4` 64 |
| `collections/lofi` | 30 | 254 | 100 | 1189 | 0 | `hh` 94, `sawtooth` 64, `bd` 59, `sd` 52, `oh` 31, `triangle` 18, `sine` 17, `rim` 11 | `a4` 49, `a3` 47, `g3` 44, `e4` 44, `g4` 43, `d4` 43, `d3` 42, `e3` 41 |
| `collections/medeival` | 20 | 70 | 98 | 583 | 0 | `sawtooth` 67, `bd` 28, `sine` 20, `hh` 18, `white` 16, `triangle` 11, `sd` 6, `cy` 2 | `g4` 49, `a4` 46, `e4` 41, `d4` 38, `f4` 37, `c5` 34, `a3` 32, `c4` 27 |
| `collections/pack-demos` | 100 | 1264 | 234 | 2691 | 0 | `hh` 758, `bd` 279, `sawtooth` 143, `sd` 121, `triangle` 63, `cp` 49, `oh` 34, `sine` 22 | `g4` 151, `a1` 134, `d2` 111, `f4` 109, `c5` 106, `c4` 96, `e2` 92, `a2` 89 |
| `collections/prog` | 15 | 138 | 62 | 732 | 0 | `hh` 60, `bd` 35, `sawtooth` 29, `sd` 23, `triangle` 23, `sine` 9, `oh` 8, `rim` 2 | `g4` 44, `f4` 38, `d5` 34, `c5` 33, `a4` 32, `c4` 29, `c3` 27, `g3` 26 |
| `collections/rim` | 15 | 43 | 63 | 949 | 0 | `sine` 30, `rim` 24, `bd` 19, `triangle` 18, `sawtooth` 15 | `b4` 81, `e5` 73, `a4` 73, `d5` 69, `g4` 64, `e4` 45, `c5` 38, `d4` 38 |
| `collections/saxophone-afterhours` | 20 | 231 | 77 | 522 | 0 | `hh` 128, `bd` 45, `sawtooth` 38, `white` 32, `sine` 29, `sd` 11, `triangle` 10, `rim` 5 | `a4` 24, `g4` 21, `a3` 21, `d5` 21, `d3` 20, `c4` 20, `c5` 19, `e4` 18 |
| `collections/similarity-gradient` | 30 | 161 | 58 | 316 | 51 | `hh` 59, `white` 50, `bd` 29, `sawtooth` 24, `rim` 19, `sine` 18, `triangle` 16, `cp` 2 | `c4` 23, `e4` 21, `a3` 17, `g4` 16, `f3` 16, `d3` 14, `c3` 13, `d4` 12 |
| `collections/study` | 30 | 252 | 87 | 619 | 0 | `white` 112, `hh` 86, `sawtooth` 30, `bd` 27, `piano` 24, `triangle` 19, `sine` 13, `sd` 11 | `g4` 40, `a4` 37, `d4` 36, `c4` 30, `e4` 29, `g3` 24, `f4` 24, `d5` 23 |
| `collections/uk-garage` | 20 | 441 | 56 | 333 | 0 | `hh` 312, `bd` 75, `sine` 32, `sd` 30, `sawtooth` 18, `rim` 12, `oh` 10, `triangle` 5 | `g1` 27, `a1` 19, `g4` 19, `c4` 15, `c2` 14, `a3` 13, `d4` 11, `e4` 11 |
| `collections/underused-palette` | 40 | 527 | 120 | 411 | 0 | `hh` 272, `bd` 111, `triangle` 40, `sawtooth` 40, `sine` 40, `bd:4` 10, `sd:3` 7, `brown` 6 | `g4` 35, `cb3` 14, `g#1` 14, `f0` 12, `as4` 10, `d#4` 10, `f7` 10, `as5` 10 |
| `collections/vocals` | 30 | 697 | 123 | 590 | 0 | `hh` 418, `sawtooth` 84, `bd` 65, `sd` 37, `white` 28, `sine` 21, `triangle` 16, `cp` 15 | `c4` 45, `a3` 39, `e4` 37, `g4` 36, `d4` 31, `g3` 25, `f4` 24, `f3` 19 |
| `collections/yt` | 20 | 110 | 27 | 77 | 0 | `hh` 49, `white` 32, `sd` 16, `sine` 11, `triangle` 7, `rim` 7, `sawtooth` 6, `bd` 4 | `c6` 7, `c4` 6, `g7` 5, `e4` 4, `g5` 4, `e6` 4, `e7` 4, `g4` 3 |
| `courses/Skola` | 17 | 144 | 45 | 184 | 28 | `hh` 77, `bd` 30, `sd` 25, `sawtooth` 16, `piano` 14, `sine` 9, `triangle` 5, `bd:4` 4 | `c4` 28, `c3` 26, `g4` 22, `e4` 17, `d4` 12, `c2` 10, `c5` 9, `eb4` 8 |
| `courses/TehnoSkola` | 10 | 33 | 1 | 5 | 0 | `bd` 33, `sawtooth` 1 | `c2` 3, `eb2` 1, `bb1` 1 |
| `tools/agent/examples` | 4 | 48 | 11 | 139 | 0 | `white` 32, `bd` 7, `piano` 6, `hh` 4, `sawtooth` 4, `sd` 2, `oh` 2, `triangle` 1 | `d5` 10, `g4` 8, `c5` 8, `a5` 7, `e5` 7, `a1` 7, `d2` 6, `g5` 5 |
| `tools/orginals` | 1 | 0 | 0 | 0 | 0 | - | - |

## Underused Palette Ideas

Low-count sounds worth revisiting: `alphabet:18` 9, `alphabet:7` 9, `sd:3` 9, `sd:1` 8, `sd:2` 8, `brown` 7, `numbers:2` 7, `alphabet:1` 6, `alphabet:17` 6, `alphabet:19` 6, `alphabet:21` 6, `alphabet:5` 6, `numbers:7` 6, `pink` 6, `alphabet:23` 5, `alphabet:3` 5, `ht` 5, `mt` 5, `numbers:0` 5, `numbers:1` 5, `numbers:3` 5, `numbers:4` 5, `rd` 5, `alphabet:12` 4, `alphabet:24` 4, `alphabet:25` 4, `alphabet:9` 4, `casio` 4, `numbers:5` 4, `numbers:6` 4, `numbers:8` 4, `numbers:9` 4, `amen` 3, `break` 3, `oh:1` 3

Low-count explicit notes worth using for register/color shifts: `a7` 8, `bb6` 8, `c#6` 8, `cs2` 8, `d0` 8, `ds3` 8, `f#5` 8, `g0` 8, `cs1` 7, `fs0` 7, `as3` 6, `c#2` 6, `g#2` 1, `g#4` 1, `gb6` 1, `gs1` 1

## Parser Notes

Dynamic note sources that were not fully expanded:

| File | Call | Argument |
| --- | --- | --- |
| `courses/Skola/cheat-05-advanced-effects.strudel` | `n` | `run(16)` |

For future updates, regenerate this document by repeating the same scan strategy: strip comments, inspect `s`, `.sound`, `.s`, `note`, `n`, and `samples`, then list exact token counts with file and folder context.
