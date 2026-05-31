# 50 GitHub Sample Repos for Strudel

Verified GitHub repositories with audio samples you can use in Strudel.
Most are **strudel-native** (they have a `strudel.json` at the root, so
they load with one line):

```js
samples('github:owner/repo')
// ↑ same as: samples('github:owner/repo/main')
```

A handful of others are general-purpose sample libraries (raw `.wav`
files) — those need either a tiny `strudel.json` mapping you write
yourself, or you can serve them somewhere and point Strudel at the URL.

Each entry below notes whether it's drop-in strudel-native (✅) or
needs a wrapper (📦).

---

## Strudel-native sample packs

These are listed in
[`terryds/awesome-strudel`](https://github.com/terryds/awesome-strudel)
and are known to load cleanly with `samples('github:…')`.

1. ✅ **[tidalcycles/Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples)** —
   the canonical SuperDirt sample bank. `bd`, `sd`, `hh`, `cp`, hundreds of
   classic samples. Strudel ships with this loaded by default.
2. ✅ **[felixroos/dough-samples](https://github.com/felixroos/dough-samples)** —
   curated bundle: piano, VCSL, mridangam, Dirt subset, tidal-drum-machines,
   EmuSP12. Used by the Strudel REPL itself.
3. ✅ **[TodePond/samples](https://github.com/TodePond/samples)** — Lu's
   personal Strudel sample collection (vocal snippets, weird textures).
4. ✅ **[yaxu/clean-breaks](https://github.com/yaxu/clean-breaks)** — clean
   chopped drum breaks curated by Alex McLean.
5. ✅ **[yaxu/spicule](https://github.com/yaxu/spicule)** — additional
   percussive and textural samples from the same author.
6. ✅ **[felixroos/estuary-samples](https://github.com/felixroos/estuary-samples)**
   — samples imported from the Estuary live-coding platform.
7. ✅ **[felixroos/samples](https://github.com/felixroos/samples)** —
   Felix Roos's personal misc sample collection.
8. ✅ **[emptyflash/samples](https://github.com/emptyflash/samples)** —
   additional Strudel-formatted pack used in workshops.
9. ✅ **[Bubobubobubobubo/Dough-Samples](https://github.com/Bubobubobubobubo/Dough-Samples)**
   — Raphaël Forment's general-purpose Strudel bank (used by Topos too).
10. ✅ **[Bubobubobubobubo/Dough-Amen](https://github.com/Bubobubobubobubo/Dough-Amen)**
    — every variant of the Amen break, ready to chop.
11. ✅ **[Bubobubobubobubo/Dough-Amiga](https://github.com/Bubobubobubobubo/Dough-Amiga)**
    — the Karsten Obarski Ultimate Tracker Amiga samples (ST01-STA0),
    pre-processed for Strudel.
12. ✅ **[Bubobubobubobubo/Dough-Fox](https://github.com/Bubobubobubobubo/Dough-Fox)**
    — Renoise/Fox-style demoscene samples.
13. ✅ **[Bubobubobubobubo/Dough-Juj](https://github.com/Bubobubobubobubo/Dough-Juj)**
    — Bubo's "Juj" pack of one-shots and oddities.
14. ✅ **[Bubobubobubobubo/Dough-Waveforms](https://github.com/Bubobubobubobubo/Dough-Waveforms)**
    — single-cycle waveforms for wavetable-style sound design.
15. ✅ **[vasilymilovidov/samples](https://github.com/vasilymilovidov/samples)**
    — Vasily Milovidov's curated Strudel pack.
16. ✅ **[danigb/samples](https://github.com/danigb/samples)** — Dani
    González's audio sample repo served from GitHub Pages, includes VCSL
    and drum machines.
17. ✅ **[algorave-dave/samples](https://github.com/algorave-dave/samples)**
    — algorave-dave's personal collection.
18. ✅ **[AuditeMarlow/samples](https://github.com/AuditeMarlow/samples)**
    — Audite Marlow's Strudel samples.
19. ✅ **[eddyflux/crate](https://github.com/eddyflux/crate)** — a
    "crate" of carefully picked sounds.
20. ✅ **[EloMorelo/samples](https://github.com/EloMorelo/samples)** —
    EloMorelo's Strudel sample pack.
21. ✅ **[emrexdeger/strudelSamples](https://github.com/emrexdeger/strudelSamples)**
    — emrexdeger's Strudel-formatted samples.
22. ✅ **[fjpolo/fjpolo-Strudel](https://github.com/fjpolo/fjpolo-Strudel)**
    — fjpolo's collection.
23. ✅ **[fstiffo/polifonia-samples](https://github.com/fstiffo/polifonia-samples)**
    — Polifonia project samples.
24. ✅ **[hvillase/cavlp-25p](https://github.com/hvillase/cavlp-25p)** —
    custom samples for a workshop / performance.
25. ✅ **[k09/samples](https://github.com/k09/samples)** — k09's pack.
26. ✅ **[kaiye10/strudelSamples](https://github.com/kaiye10/strudelSamples)**
    — kaiye10's Strudel samples.
27. ✅ **[mot4i/garden](https://github.com/mot4i/garden)** — the "garden"
    sample collection.
28. ✅ **[mysinglelise/msl-strudel-samples](https://github.com/mysinglelise/msl-strudel-samples)**
    — MSL's Strudel pack.
29. ✅ **[Nikeryms/Samples](https://github.com/Nikeryms/Samples)** — Nikeryms's
    Strudel-ready samples.
30. ✅ **[prismograph/departure](https://github.com/prismograph/departure)**
    — themed "departure" sample set.
31. ✅ **[QuantumVillage/quantum-music](https://github.com/QuantumVillage/quantum-music)**
    — Quantum Village conference live-coding samples.
32. ✅ **[RikyBac15/samples](https://github.com/RikyBac15/samples)** —
    RikyBac15's pack.
33. ✅ **[salsicha/capoeira_strudel](https://github.com/salsicha/capoeira_strudel)**
    — capoeira percussion samples.
34. ✅ **[sonidosingapura/rochormatic](https://github.com/sonidosingapura/rochormatic)**
    — Sonido Singapura's "rochormatic" set.
35. ✅ **[terrorhank/samples](https://github.com/terrorhank/samples)** —
    terrorhank's Strudel samples.
36. ✅ **[tesspilot/samples](https://github.com/tesspilot/samples)** —
    tesspilot's pack.
37. ✅ **[TristanCacqueray/mirus](https://github.com/TristanCacqueray/mirus)**
    — Tristan Cacqueray's curated pack.
38. ✅ **[Veikkosuhonen/graffathon25-demo](https://github.com/Veikkosuhonen/graffathon25-demo)**
    — Graffathon 2025 demo samples.
39. ✅ **[wyan/livecoding-samples](https://github.com/wyan/livecoding-samples)**
    — Wyan's live-coding sample bundle.
40. ✅ **[AustinOliverHaskell/ms-teams-sounds-strudel](https://github.com/AustinOliverHaskell/ms-teams-sounds-strudel)**
    — joke pack: Microsoft Teams notification sounds, ready for Strudel.

---

## Tidal/SuperDirt-compatible (need a small `strudel.json` wrapper)

41. 📦 **[geikha/tidal-drum-machines](https://github.com/geikha/tidal-drum-machines)**
    — huge collection of classic drum machines (TR-808, 909, LinnDrum,
    SP-12, etc.) packaged for SuperDirt.
42. 📦 **[daslyfe/StrudelDirt](https://github.com/daslyfe/StrudelDirt)** —
    SuperDirt fork tailored to match Strudel's webaudio engine.
43. 📦 **[sgossner/VCSL](https://github.com/sgossner/VCSL)** — Versilian
    Community Sample Library (CC0). Orchestral and folk instruments,
    multi-sampled.

---

## Drum machine and beat datasets

44. 📦 **[Boochi44/free-drum-samples](https://github.com/Boochi44/free-drum-samples)**
    — three CC0 hip-hop / trap kits (kicks, 808s, snares, claps, hats,
    perc).
45. 📦 **[gregharvey/drum-samples](https://github.com/gregharvey/drum-samples)**
    — open-source drum samples and loops.
46. 📦 **[patchbanks/Lo-Fi-Drums-Dataset](https://github.com/patchbanks/Lo-Fi-Drums-Dataset)**
    — 10,000 lo-fi hip-hop drum loops, CC-BY 4.0, with JSON labels.
47. 📦 **[patchbanks/WaivOps-EDM-TECH](https://github.com/patchbanks/WaivOps-EDM-TECH)**
    — 11,270 techno drum loops, CC-BY 4.0.
48. 📦 **[patchbanks/WaivOps-HH-LFBB](https://github.com/patchbanks/WaivOps-HH-LFBB)**
    — 3,332 lo-fi boom-bap drum recordings, CC-BY 4.0.
49. 📦 **[jonathanmc/audio](https://github.com/jonathanmc/audio)** — 78
    free TR-909 samples, every drum and tone.
50. 📦 **[bratpeki/sample-packs](https://github.com/bratpeki/sample-packs)**
    — meta-list of links to royalty-free sample packs (200 free breaks,
    355 breakbeats, etc.) — useful index when you've exhausted the rest.

---

## Bonus: instruments and field recordings (also useful)

These didn't make the top 50 but are worth knowing about:

- **[nbrosowsky/tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments)**
  — multi-sampled bass, guitar, piano, organ, harp, etc. as `.mp3`/`.ogg`,
  originally for Tone.js but trivial to wrap for Strudel.
- **[pumodi/open-samples](https://github.com/pumodi/open-samples)** —
  community-contributed 24-bit/48 kHz sample collection.
- **[adafruit/Adafruit-Sound-Samples](https://github.com/adafruit/Adafruit-Sound-Samples)**
  — CC0 sounds (originally for embedded projects, but they're just `.wav`s).
- **[pdx-cs-sound/wavs](https://github.com/pdx-cs-sound/wavs)** — CC0 WAV
  collection used in PSU's Computers, Sound and Music course.
- **[CrispyCrafter/AudioNet](https://github.com/CrispyCrafter/AudioNet)** —
  CC samples processed from Freesound features.
- **[MTG/freesound-datasets](https://github.com/MTG/freesound-datasets)**
  — labelled audio datasets built on top of Freesound.
- **[CarlGao4/Muse-Sounds](https://github.com/CarlGao4/Muse-Sounds)** —
  Muse Sounds in SF2/SF3 format (you'll need to render to `.wav`).
- **[open-soundfonts/SGM_V2_01_soundfonts](https://github.com/open-soundfonts/SGM_V2_01_soundfonts)**
  — General MIDI soundfont collection.
- **[sfzinstruments/karoryfer.emilyguitar](https://github.com/sfzinstruments/karoryfer.emilyguitar)**
  — open-source SFZ guitar instrument.
- **[maRce10/NatureSounds](https://github.com/maRce10/NatureSounds)** —
  bioacoustic field recordings.

---

## How to load any of these into Strudel

**Strudel-native (✅) — just one line:**

```js
samples('github:Bubobubobubobubo/Dough-Amiga')
s("st01:0 st02:5 st01:7")
```

**Wrapper for raw `.wav` repos (📦) — write a tiny `strudel.json`:**

Strudel reads a JSON map of names → URLs. Host this anywhere (GitHub
Pages, your own static server, Cloudflare R2, …):

```json
{
  "_base": "https://raw.githubusercontent.com/owner/repo/main/path/to/folder/",
  "kick":  ["kick_01.wav", "kick_02.wav", "kick_03.wav"],
  "snare": ["snare_01.wav", "snare_02.wav"]
}
```

Then in Strudel:

```js
samples('https://your-host/strudel.json')
s("kick:0 snare ~ kick:2")
```

**Find new ones live:** the
[open-strudel-samples](https://therebelrobot.github.io/open-strudel-samples/)
explorer searches all public GitHub repos for `strudel.json` files and
lets you preview the contents in the browser before loading.

---

## License notes

Most of the strudel-native packs in this list inherit the licenses of
their source samples — **check each repo's README before using in
commercial work.** The `Dirt-Samples` pack and CC0-marked entries
(like `Boochi44/free-drum-samples`, the `patchbanks/*` datasets, and
`pdx-cs-sound/wavs`) are the safest for commercial release.
