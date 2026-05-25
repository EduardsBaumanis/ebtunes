#!/usr/bin/env python3
"""Generate two strudel demo songs per sample repo from STRUDEL_SAMPLE_REPOS.md.

Each demo loads `samples('github:owner/repo')` so the repo's bank is
available in the REPL, then plays a complete pattern. Patterns deliberately
use the standard SuperDirt names (bd, sd, hh, cp, perc, …) and pitched
synth voices so the file is musically functional even before you swap in
the pack-specific sample names — once the pack is loaded, replace any of
the s("…") triggers with names from the loaded bank to hear it through
that pack.

Run: `python pack-demos/_generate.py` from the repo root. Idempotent —
overwrites existing files in pack-demos/.
"""

from pathlib import Path

OUT = Path(__file__).parent

# ── Repos: (slug, owner/repo, display_name, [template1, template2]) ─────────
# Templates are picked to suit the pack's character: drum-leaning packs get
# beat-driven templates, melodic packs get harmonic templates, etc.
REPOS = [
    # Strudel-native (40)
    ("dirt",          "tidalcycles/Dirt-Samples",                 "Dirt Samples",       ["boom_bap", "techno"]),
    ("dough",         "felixroos/dough-samples",                  "Dough Samples",      ["lofi", "house"]),
    ("todepond",      "TodePond/samples",                         "TodePond",           ["idm", "ambient"]),
    ("clean-breaks",  "yaxu/clean-breaks",                        "Clean Breaks",       ["dnb", "boom_bap"]),
    ("spicule",       "yaxu/spicule",                             "Spicule",            ["idm", "techno"]),
    ("estuary",       "felixroos/estuary-samples",                "Estuary",            ["ambient", "lofi"]),
    ("felixroos",     "felixroos/samples",                        "Felix Roos Pack",    ["lofi", "pop"]),
    ("emptyflash",    "emptyflash/samples",                       "Emptyflash",         ["house", "trap"]),
    ("bubo-samples",  "Bubobubobubobubo/Dough-Samples",           "Bubo Samples",       ["techno", "ambient"]),
    ("amen",          "Bubobubobubobubo/Dough-Amen",              "Amen Break",         ["dnb", "boom_bap"]),
    ("amiga",         "Bubobubobubobubo/Dough-Amiga",             "Amiga Trackers",     ["chiptune", "idm"]),
    ("fox",           "Bubobubobubobubo/Dough-Fox",               "Dough Fox",          ["chiptune", "pop"]),
    ("juj",           "Bubobubobubobubo/Dough-Juj",               "Dough Juj",          ["idm", "trap"]),
    ("waveforms",     "Bubobubobubobubo/Dough-Waveforms",         "Single-Cycle Waves", ["acid", "ambient"]),
    ("vasily",        "vasilymilovidov/samples",                  "Vasily Milovidov",   ["lofi", "house"]),
    ("danigb",        "danigb/samples",                           "Dani GB",            ["pop", "techno"]),
    ("algorave-dave", "algorave-dave/samples",                    "Algorave Dave",      ["acid", "techno"]),
    ("audite",        "AuditeMarlow/samples",                     "Audite Marlow",      ["ambient", "idm"]),
    ("crate",         "eddyflux/crate",                           "Crate",              ["boom_bap", "trap"]),
    ("elomorelo",     "EloMorelo/samples",                        "EloMorelo",          ["pop", "house"]),
    ("emrex",         "emrexdeger/strudelSamples",                "Emrex Deger",        ["techno", "dnb"]),
    ("fjpolo",        "fjpolo/fjpolo-Strudel",                    "fjpolo",             ["lofi", "ambient"]),
    ("polifonia",     "fstiffo/polifonia-samples",                "Polifonia",          ["ambient", "pop"]),
    ("cavlp",         "hvillase/cavlp-25p",                       "Cavlp 25P",          ["idm", "techno"]),
    ("k09",           "k09/samples",                              "k09",                ["acid", "house"]),
    ("kaiye10",       "kaiye10/strudelSamples",                   "kaiye10",            ["trap", "lofi"]),
    ("garden",        "mot4i/garden",                             "Garden",             ["ambient", "lofi"]),
    ("msl",           "mysinglelise/msl-strudel-samples",         "MSL",                ["lofi", "house"]),
    ("nikeryms",      "Nikeryms/Samples",                         "Nikeryms",           ["techno", "trap"]),
    ("departure",     "prismograph/departure",                    "Departure",          ["ambient", "idm"]),
    ("quantum",       "QuantumVillage/quantum-music",             "Quantum Village",    ["acid", "idm"]),
    ("rikybac15",     "RikyBac15/samples",                        "RikyBac15",          ["pop", "boom_bap"]),
    ("capoeira",      "salsicha/capoeira_strudel",                "Capoeira",           ["ethnic", "ambient"]),
    ("rochormatic",   "sonidosingapura/rochormatic",              "Rochormatic",        ["idm", "ambient"]),
    ("terrorhank",    "terrorhank/samples",                       "terrorhank",         ["techno", "dnb"]),
    ("tesspilot",     "tesspilot/samples",                        "tesspilot",          ["trap", "house"]),
    ("mirus",         "TristanCacqueray/mirus",                   "Mirus",              ["ambient", "acid"]),
    ("graffathon",    "Veikkosuhonen/graffathon25-demo",          "Graffathon 2025",    ["chiptune", "techno"]),
    ("wyan",          "wyan/livecoding-samples",                  "Wyan Livecoding",    ["pop", "house"]),
    ("ms-teams",      "AustinOliverHaskell/ms-teams-sounds-strudel", "MS Teams",        ["pop", "idm"]),

    # Tidal/SuperDirt-compatible (3)
    ("tidal-drums",   "geikha/tidal-drum-machines",               "Tidal Drum Machines",["techno", "house"]),
    ("strudeldirt",   "daslyfe/StrudelDirt",                      "StrudelDirt",        ["boom_bap", "dnb"]),
    ("vcsl",          "sgossner/VCSL",                            "VCSL",               ["pop", "ambient"]),

    # Drum / beat datasets (7)
    ("free-drums",    "Boochi44/free-drum-samples",               "Free Drum Samples",  ["trap", "boom_bap"]),
    ("greg-drums",    "gregharvey/drum-samples",                  "Greg Harvey Drums",  ["house", "techno"]),
    ("patch-lofi",    "patchbanks/Lo-Fi-Drums-Dataset",           "Patchbanks Lo-Fi",   ["lofi", "boom_bap"]),
    ("patch-techno",  "patchbanks/WaivOps-EDM-TECH",              "Patchbanks Techno",  ["techno", "acid"]),
    ("patch-hh",      "patchbanks/WaivOps-HH-LFBB",               "Patchbanks Boom-Bap",["boom_bap", "trap"]),
    ("tr909",         "jonathanmc/audio",                         "TR-909 Pack",        ["house", "techno"]),
    ("bratpeki",      "bratpeki/sample-packs",                    "bratpeki Index",     ["dnb", "trap"]),
]

assert len(REPOS) == 50, f"expected 50 repos, got {len(REPOS)}"

# ── Header common to every file ─────────────────────────────────────────────
HEADER = """\
// ══════════════════════════════════════════════════════════════
// "{title}"
// {style_name} pattern using the {pack_name} sample pack
//
// Key:    {key}
// Tempo:  {bpm} BPM  (setcpm {cpm})
// Chords: {chords}
// Feel:   {feel}
// Loads:  github:{repo}
// Tip:    after the pack loads, swap any s("...") name above for one
//         from the pack to hear the same pattern through it.
// ══════════════════════════════════════════════════════════════

samples('github:{repo}')

setcpm({cpm})

"""


# ── Templates ───────────────────────────────────────────────────────────────
# Each entry: title-flavour, style_name, key, bpm, chords, feel, body
TEMPLATES = {

    "lofi": dict(
        title="Velvet Dust",
        style_name="Lo-fi hip hop",
        key="C minor",
        bpm=72, cpm=18,
        chords="Cm7 – Abmaj7 – Ebmaj7 – Bb7",
        feel="Slow, warm, late-night. Vinyl crackle and walking bass.",
        body="""\
stack(
  s("bd ~ ~ ~ bd ~ ~ ~").gain(0.78).lpf(2400),
  s("~ ~ sd ~ ~ ~ sd ~").gain(0.58).room(0.18),
  s("[hh [~ hh]]*4").gain(0.32).lpf(8500).pan(0.6),
  note("c2 eb2 g2 bb2  ab1 c2 eb2 g2  eb2 g2 bb2 d3  bb1 d2 f2 ab2")
    .sound("sawtooth").lpf(220).gain(0.6)
    .attack(0.01).release(0.1),
  note("<[c4,eb4,g4,bb4] [ab3,c4,eb4,g4] [eb4,g4,bb4,d5] [bb3,d4,f4,ab4]>")
    .sound("sawtooth").attack(0.06).release(0.45)
    .lpf(1900).room(0.32).gain(0.28).slow(2),
  note("c5 ~ eb5 ~ g4 bb4 ~ c5  ~ ~ g4 ~ f4 ~ eb4 ~")
    .sound("triangle").attack(0.012).release(0.3)
    .delay(0.38).delaytime(0.375).delayfeedback(0.25)
    .room(0.5).gain(0.42).slow(2)
)
""",
    ),

    "boom_bap": dict(
        title="Crate Digger",
        style_name="Boom-bap hip hop",
        key="A minor",
        bpm=88, cpm=22,
        chords="Am7 – Dm7 – G7 – Cmaj7",
        feel="Dusty 90s break with crunchy snare and warm sub.",
        body="""\
stack(
  s("bd ~ ~ bd ~ bd ~ ~").gain(0.85).lpf(220),
  s("~ ~ sd ~ ~ ~ sd ~").gain(0.7).hpf(220).room(0.14).shape(0.2),
  s("hh*8").gain(0.36).hpf(2200).pan("0.45 0.55").degradeBy(0.1),
  s("~ ~ ~ ~ ~ ~ ~ oh").gain(0.4),
  note("a1 a1 e2 a1  d2 d2 a1 d2  g1 g1 d2 g1  c2 c2 g1 c2")
    .sound("sawtooth").lpf(360).gain(0.55).attack(0.005),
  note("<[a3,c4,e4,g4] [d4,f4,a4,c5] [g3,b3,d4,f4] [c4,e4,g4,b4]>")
    .sound("sawtooth").lpf(2200).attack(0.04).release(0.4)
    .gain(0.25).slow(2)
)
""",
    ),

    "house": dict(
        title="Four On",
        style_name="House",
        key="F minor",
        bpm=124, cpm=31,
        chords="Fm9 – Bbm9 – Eb9 – Ab9",
        feel="Pumping four-to-the-floor with shuffled hats and a rolling bass.",
        body="""\
stack(
  s("bd*4").gain(0.9).lpf(160),
  s("~ cp ~ cp").gain(0.5).room(0.2),
  s("[hh [~ hh]]*4").gain(0.4).hpf(3200).pan("0.4 0.6"),
  s("~ ~ oh ~").gain(0.32).hpf(2500),
  note("f1 f1 c2 f1  bb1 bb1 f2 bb1  eb1 eb1 bb1 eb1  ab1 ab1 eb2 ab1")
    .sound("sawtooth").lpf(420).gain(0.55),
  note("<[f4,ab4,c5,g5] [bb3,db4,f4,c5] [eb4,g4,bb4,f5] [ab3,c4,eb4,bb4]>")
    .sound("sawtooth").attack(0.05).release(0.38)
    .lpf(2400).gain(0.28).pan(0.55).slow(2)
)
""",
    ),

    "dnb": dict(
        title="Amen Forever",
        style_name="Drum and bass",
        key="D minor",
        bpm=174, cpm=43.5,
        chords="Dm – Bb – F – C",
        feel="Chopped break, sub Reese and atmospheric pad. 174 BPM.",
        body="""\
stack(
  s("bd ~ ~ sd  ~ bd ~ sd").gain(0.85).lpf(360),
  s("hh*16").gain(0.3).hpf(4500).degradeBy(0.2),
  s("~ ~ ~ ~ ~ ~ ~ cp").gain(0.45).room(0.3),
  note("d1 ~ d1 ~  d1 ~ a0 ~  bb0 ~ bb0 ~  f0 ~ c1 ~")
    .sound("sawtooth").lpf(180).attack(0.005).release(0.18).gain(0.7),
  note("<[d4,f4,a4] [bb3,d4,f4] [f3,a3,c4] [c4,e4,g4]>")
    .sound("sawtooth").attack(0.6).release(0.6)
    .lpf(1400).gain(0.18).room(0.5).slow(4)
)
""",
    ),

    "ambient": dict(
        title="Long Horizon",
        style_name="Ambient drone",
        key="E♭ major",
        bpm=60, cpm=15,
        chords="Ebmaj9 – Cm9 – Abmaj9 – Bb9",
        feel="Slow-evolving pad, breathy texture, sparse percussion.",
        body="""\
stack(
  note("<[eb3,g3,bb3,d4,f4] [c3,eb3,g3,bb3,d4] [ab2,c3,eb3,g3,bb3] [bb2,d3,f3,ab3,c4]>")
    .sound("sawtooth").attack(0.8).release(2.0)
    .lpf(1600).gain(0.32).room(0.7).pan(0.5).slow(4),
  note("<eb5 g5 bb5 c6>")
    .sound("triangle").attack(0.4).release(1.5)
    .delay(0.55).delaytime(0.5).delayfeedback(0.5)
    .gain(0.22).pan(0.55).slow(4),
  s("~ ~ ~ ~ ~ ~ ~ bd").gain(0.4).lpf(140).slow(2),
  s("hh ~ ~ hh").gain(0.1).hpf(7000).degradeBy(0.6),
  note("eb2 ~ ~ ~ ~ ~ ~ ~").sound("sine")
    .attack(0.4).release(2).gain(0.28)
)
""",
    ),

    "chiptune": dict(
        title="Bit Crush",
        style_name="Chiptune / 8-bit",
        key="A major",
        bpm=140, cpm=35,
        chords="A – E – F#m – D",
        feel="Square waves, fast arps, tracker-style energy.",
        body="""\
stack(
  s("bd ~ ~ ~ bd ~ ~ ~").gain(0.7).lpf(280),
  s("~ ~ sd ~ ~ ~ sd ~").gain(0.55).hpf(900),
  s("hh*8").gain(0.28).hpf(5000),
  note("a4 cs5 e5 a5  e4 gs4 b4 e5  fs4 a4 cs5 fs5  d4 fs4 a4 d5")
    .sound("square").attack(0.001).decay(0.06).sustain(0)
    .gain(0.4),
  note("a2 ~ a2 ~  e2 ~ e2 ~  fs2 ~ fs2 ~  d2 ~ d2 ~")
    .sound("square").lpf(700).gain(0.42).attack(0.001),
  note("<a5 e5 fs5 d5>")
    .sound("triangle").attack(0.001).decay(0.05).sustain(0)
    .gain(0.22)
)
""",
    ),

    "acid": dict(
        title="303 Squelch",
        style_name="Acid",
        key="A minor",
        bpm=132, cpm=33,
        chords="Am – Am – Dm – Am",
        feel="Resonant 303-style line with slowly opening filter.",
        body="""\
stack(
  s("bd*4").gain(0.88).lpf(150),
  s("~ ~ cp ~").gain(0.45).room(0.18),
  s("hh*8").gain(0.34).hpf(5000).pan("0.4 0.6"),
  note("a2 a3 c3 a2  e2 a2 c3 e2  d2 a2 d3 a2  a2 c3 e3 a2")
    .sound("sawtooth")
    .lpf("400 600 1200 2200 3200 4200 2200 800")
    .lpq(15).attack(0.001).decay(0.08).sustain(0.3).release(0.05)
    .gain(0.5).shape(0.3),
  note("<[a3,c4,e4] [d4,f4,a4]>")
    .sound("sawtooth").attack(0.05).release(0.4)
    .lpf(1800).gain(0.18).pan(0.55).slow(2)
)
""",
    ),

    "trap": dict(
        title="Slow Roll",
        style_name="Trap",
        key="F minor",
        bpm=140, cpm=35,
        chords="Fm – Db – Ab – Eb",
        feel="Slow halftime kick, crisp 808 hats, deep sub bass.",
        body="""\
stack(
  s("bd ~ ~ ~ ~ ~ bd ~").gain(0.92).lpf(160),
  s("~ ~ ~ ~ sd ~ ~ ~").gain(0.65).room(0.2),
  s("hh*16").gain(0.3).hpf(4500).pan("0.45 0.55"),
  s("~ ~ ~ ~ ~ ~ ~ [hh*4]").gain(0.32).hpf(5000),
  note("f1 ~ ~ ~ ~ ~ db1 ~  ab0 ~ ~ ~ eb1 ~ ~ ~")
    .sound("sine").attack(0.005).release(0.5).gain(0.85),
  note("<[f4,ab4,c5] [db4,f4,ab4] [ab3,c4,eb4] [eb4,g4,bb4]>")
    .sound("triangle").attack(0.04).release(0.5)
    .lpf(1600).gain(0.22).slow(2)
)
""",
    ),

    "ethnic": dict(
        title="Polyrhythm Roof",
        style_name="World percussion",
        key="D dorian",
        bpm=110, cpm=27.5,
        chords="Dm – G – Dm – C",
        feel="Layered polyrhythms — frame drum, tabla, hand-claps.",
        body="""\
stack(
  s("bd ~ ~ bd ~ bd ~ ~").gain(0.78).lpf(280),
  s("~ tabla ~ ~ tabla ~ tabla ~").gain(0.5),
  s("cp(3,8)").gain(0.4).room(0.18),
  s("hh*12").gain(0.28).hpf(3500).pan("0.4 0.55 0.6"),
  note("d2 ~ a2 ~ d2 g2 ~ a2  d2 ~ a2 ~ c3 ~ a2 ~")
    .sound("sawtooth").lpf(360).gain(0.55).attack(0.008),
  note("<d4 e4 f4 g4 a4 g4 f4 e4>")
    .sound("triangle").attack(0.04).release(0.3)
    .gain(0.32).pan(0.55).delay(0.25).delaytime(0.333)
)
""",
    ),

    "idm": dict(
        title="Glitch Garden",
        style_name="IDM / glitch",
        key="C minor",
        bpm=128, cpm=32,
        chords="Cm – Eb – Ab – G",
        feel="Broken rhythms, stutter, tape-stop fragments.",
        body="""\
stack(
  s("bd ~ [~ bd] ~  ~ [bd bd] ~ ~").gain(0.82).lpf(320),
  s("~ ~ sd [sd*2 ~] ~ ~ sd ~").gain(0.6).hpf(800).shape(0.3),
  s("hh*16").gain(0.3).hpf(5000).degradeBy(0.4)
    .speed(rand.range(0.8, 1.4)),
  s("~ ~ rim ~ ~ rim ~ ~").gain(0.35).hpf(3200),
  note("c2 ~ ~ ~  eb2 ~ ~ ~  ab1 ~ ~ ~  g1 ~ ~ ~")
    .sound("sawtooth").lpf(280).gain(0.5)
    .attack(0.003).release(0.1),
  note("<[c5 eb5 g5] [eb5 g5 bb5] [ab4 c5 eb5] [g4 b4 d5]>")
    .sound("triangle").attack(0.005).release(0.18)
    .gain(0.3).delay(0.4).delaytime(0.166).delayfeedback(0.45)
)
""",
    ),

    "techno": dict(
        title="Iron Loop",
        style_name="Techno",
        key="A minor",
        bpm=130, cpm=32.5,
        chords="Am – Am – Dm – Am",
        feel="Driving 4/4 thump, hypnotic loop, industrial edge.",
        body="""\
stack(
  s("bd*4").gain(0.92).lpf(170).shape(0.2),
  s("~ ~ cp ~").gain(0.42).room(0.22),
  s("[hh [~ hh]]*4").gain(0.38).hpf(4500).pan("0.4 0.6"),
  s("~ ~ ~ ~ ~ ~ ~ oh").gain(0.3),
  note("a1 a1 a2 a1  e2 e2 a2 e2  d2 d2 a1 d2  a1 a1 e2 a1")
    .sound("sawtooth").lpf(380).attack(0.001).gain(0.55).shape(0.15),
  note("<[a4 c5 e5 a5] [d5 f5 a5 d6] [c5 e5 g5 c6] [e4 g4 b4 e5]>")
    .sound("sawtooth").attack(0.005).release(0.18)
    .lpf(2200).gain(0.22).pan(0.55).delay(0.3).delaytime(0.333)
)
""",
    ),

    "pop": dict(
        title="Bright Window",
        style_name="Synth-pop",
        key="G major",
        bpm=110, cpm=27.5,
        chords="G – Em – C – D",
        feel="Cheerful synth pop, plucky lead, simple groove.",
        body="""\
stack(
  s("bd ~ ~ ~ bd ~ ~ ~").gain(0.78).lpf(220),
  s("~ ~ sd ~ ~ ~ sd ~").gain(0.55).room(0.16),
  s("hh*8").gain(0.32).hpf(3800).pan("0.45 0.55"),
  note("g2 ~ d3 ~  e2 ~ b2 ~  c2 ~ g2 ~  d2 ~ a2 ~")
    .sound("sawtooth").lpf(420).gain(0.55).attack(0.006),
  note("<[g4,b4,d5] [e4,g4,b4] [c4,e4,g4] [d4,fs4,a4]>")
    .sound("triangle").attack(0.06).release(0.4)
    .lpf(2400).gain(0.32).pan(0.5).slow(2),
  note("d5 ~ b4 g4  ~ b4 ~ d5  e5 ~ b4 ~  d5 ~ a4 ~")
    .sound("triangle").attack(0.005).release(0.2)
    .gain(0.4).pan(0.55).delay(0.3).delaytime(0.25).delayfeedback(0.3)
)
""",
    ),
}


# ── Variation helpers — tiny tweaks so the two demos per repo aren't twins ──
TITLE_TWEAKS = {
    1: lambda t, name: f"{name} — {t}",
    2: lambda t, name: f"{name} — {t} (Reprise)",
}


def render(template_key, repo, pack_name, idx):
    t = TEMPLATES[template_key]
    title = TITLE_TWEAKS[idx](t["title"], pack_name)
    header = HEADER.format(
        title=title,
        style_name=t["style_name"],
        key=t["key"],
        bpm=t["bpm"],
        cpm=t["cpm"],
        chords=t["chords"],
        feel=t["feel"],
        repo=repo,
        pack_name=pack_name,
    )
    return header + t["body"]


def main():
    files = []
    for slug, repo, name, (t1, t2) in REPOS:
        for idx, tname in enumerate([t1, t2], start=1):
            content = render(tname, repo, name, idx)
            path = OUT / f"{slug}-{idx}-{tname}.strudel"
            path.write_text(content)
            files.append(path.name)
    print(f"wrote {len(files)} files to {OUT}")


if __name__ == "__main__":
    main()
