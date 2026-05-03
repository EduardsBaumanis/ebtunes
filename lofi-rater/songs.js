const SONGS = [
  {
    id: "song-01",
    title: "3am Rain",
    subtitle: "Lo-fi hip hop / jazz",
    key: "C minor",
    bpm: 72,
    feel: "Dusty, warm, like a lamp through a rainy window",
    chords: "Cm7 → Abmaj7 → Ebmaj7 → Bb7",
    tags: ["slow", "melancholic", "night", "rain"],
    code: `setcpm(36)

stack(
  s("bd ~ ~ ~ bd ~ ~ ~")
    .gain(0.82)
    .lpf(3200),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.68)
    .room(0.12),

  s("[hh [~ hh]]*4")
    .gain(0.3)
    .lpf(10000)
    .pan(0.62),

  s("~ ~ ~ ~ ~ ~ ~ oh")
    .gain(0.48)
    .pan(0.58),

  note("c2 eb2 g2 bb2  ab2 c3 eb3 g3  eb2 g2 bb2 d3  bb2 d3 f3 ab3")
    .sound("sawtooth")
    .lpf(380)
    .attack(0.008).decay(0.12).sustain(0.45).release(0.08)
    .gain(0.62),

  note("<[c4,eb4,g4,bb4] [ab3,c4,eb4,g4] [eb4,g4,bb4,d5] [bb3,d4,f4,ab4]>")
    .sound("sawtooth")
    .attack(0.06)
    .release(0.45)
    .lpf(2000)
    .room(0.32)
    .gain(0.28)
    .pan(0.43)
    .slow(2),

  note("c5 ~ eb5 ~ g4 bb4 ~ c5  ~ ~ g4 ~ f4 ~ eb4 ~")
    .sound("triangle")
    .attack(0.012)
    .release(0.3)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.25)
    .room(0.5)
    .gain(0.46)
    .pan(0.53)
    .slow(2)
)`
  },
  {
    id: "song-02",
    title: "Blue Smoke",
    subtitle: "Modal jazz / lo-fi",
    key: "D Dorian",
    bpm: 80,
    feel: "Miles Davis \"Kind of Blue\" meets dusty bedroom tape",
    chords: "Dm9 → G9 → Cmaj9 → Am7",
    tags: ["dorian", "modal", "introspective"],
    code: `setcpm(40)

stack(
  s("bd ~ bd ~ ~ bd ~ ~")
    .gain(0.78)
    .lpf(3800)
    .room(0.08),

  s("~ ~ <sd rim> ~ ~ ~ <sd rim> ~")
    .gain(0.7)
    .room(0.18),

  s("[hh [~ hh]]*4")
    .gain(0.28)
    .hpf(6000)
    .pan(0.64)
    .room(0.06),

  s("~ oh ~ ~ oh [oh oh] ~ ~")
    .gain(0.32)
    .hpf(4500)
    .pan(0.38)
    .room(0.1),

  note("d2 ~ a2 ~ ~ ~  g2 ~ d3 ~ ~ ~  c2 ~ g2 ~ ~ ~  a2 ~ e3 ~ ~ ~")
    .sound("sawtooth")
    .lpf(420)
    .attack(0.006).decay(0.14).sustain(0.4).release(0.09)
    .gain(0.65)
    .slow(3),

  note("<[d4,f4,c5,e5] [g3,b3,f4,a4] [c4,e4,b4,d5] [a3,e4,g4,c5]>")
    .sound("sawtooth")
    .attack(0.05)
    .release(0.55)
    .lpf(1900)
    .room(0.38)
    .size(0.6)
    .gain(0.27)
    .pan(0.42)
    .slow(2),

  note("a4 ~ c5 b4  ~ g4 ~ a4  ~ ~ d5 ~  c5 ~ b4 a4")
    .sound("square")
    .lpf(3500)
    .attack(0.01)
    .release(0.22)
    .delay(0.35)
    .delaytime(0.333)
    .delayfeedback(0.28)
    .room(0.42)
    .gain(0.44)
    .pan(0.55)
    .slow(2)
)`
  },
  {
    id: "song-03",
    title: "Sunday Corner",
    subtitle: "Lo-fi bossa nova jazz",
    key: "F major",
    bpm: 86,
    feel: "Café window seat, coffee going cold, golden hour dust",
    chords: "Fmaj7 → Dm7 → Gm7 → C7",
    tags: ["bossa nova", "bright", "morning"],
    code: `setcpm(43)

stack(
  s("bd").euclid(3, 8)
    .gain(0.75)
    .lpf(4000),

  s("<rim cp>").euclid(2, 8)
    .gain(0.6)
    .room(0.14)
    .pan(0.5),

  s("hh").euclid(5, 8)
    .gain(0.3)
    .hpf(7000)
    .pan(0.63)
    .room(0.05),

  s("oh/2")
    .gain(0.38)
    .hpf(5000)
    .pan(0.6),

  note("f2 ~ ~ c3 ~ ~ ~ ~  d2 ~ ~ a2 ~ ~ ~ ~  g2 ~ ~ d3 ~ ~ ~ ~  c2 ~ ~ g2 ~ ~ ~ ~")
    .sound("sawtooth")
    .lpf(450)
    .attack(0.006).decay(0.1).sustain(0.5).release(0.1)
    .gain(0.6)
    .slow(4),

  note("<[f4,a4,e5] [d4,f4,c5] [g4,bb4,f5] [c4,e4,bb4]>")
    .sound("sawtooth")
    .attack(0.02)
    .decay(0.15)
    .sustain(0.45)
    .release(0.4)
    .lpf(2400)
    .room(0.28)
    .gain(0.32)
    .pan(0.4)
    .slow(2),

  note("<[f3,a3,e4] [d3,f3,c4] [g3,bb3,f4] [c3,e3,bb3]>")
    .sound("sawtooth")
    .attack(0.5)
    .release(0.8)
    .lpf(1200)
    .room(0.55)
    .size(0.6)
    .gain(0.18)
    .pan(0.6)
    .slow(2),

  note("f4 ~ a4 ~ c5 ~ d5 c5  a4 ~ g4 ~ f4 ~ ~ a4")
    .sound("sine")
    .attack(0.02)
    .release(0.35)
    .delay(0.42)
    .delaytime(0.333)
    .delayfeedback(0.22)
    .room(0.4)
    .gain(0.52)
    .pan(0.48)
    .slow(2)
)`
  },
  {
    id: "song-04",
    title: "Midnight Walk",
    subtitle: "Lo-fi jazz",
    key: "Bb minor",
    bpm: 70,
    feel: "Empty streets, wet pavement reflecting streetlights, headphones in",
    chords: "Bbm7 → Gbmaj7 → Dbmaj7 → Ab7",
    tags: ["slow", "melancholic", "night"],
    code: `setcpm(35)

stack(
  s("bd ~ ~ ~ ~ bd ~ ~")
    .gain(0.8)
    .lpf(3000),

  s("~ ~ ~ sd ~ ~ ~ sd")
    .gain(0.65)
    .room(0.14),

  s("[hh [~ hh]]*4")
    .gain(0.28)
    .lpf(11000)
    .pan(0.63),

  note("bb2 db3 f3 ab3  gb2 bb2 db3 f3  db2 f2 ab2 c3  ab2 c3 eb3 gb3")
    .sound("sawtooth")
    .lpf(400)
    .attack(0.007).decay(0.14).sustain(0.42).release(0.08)
    .gain(0.62),

  note("<[bb3,db4,f4,ab4] [gb3,bb3,db4,f4] [db4,f4,ab4,c5] [ab3,c4,eb4,gb4]>")
    .sound("sawtooth")
    .attack(0.07)
    .release(0.5)
    .lpf(2000)
    .room(0.38)
    .gain(0.28)
    .pan(0.42)
    .slow(2),

  note("bb4 ~ ~ ab4 ~ f4 ~ ~ eb4 ~ ~ db4 ~ f4 ~ bb3")
    .sound("sawtooth")
    .attack(0.06)
    .release(0.4)
    .lpf(2800)
    .delay(0.35)
    .delaytime(0.375)
    .delayfeedback(0.22)
    .room(0.5)
    .gain(0.44)
    .pan(0.53)
    .slow(2)
)`
  },
  {
    id: "song-05",
    title: "Café Crème",
    subtitle: "Lo-fi jazz",
    key: "G major",
    bpm: 78,
    feel: "Morning light through café windows, coffee going warm, no rush",
    chords: "Gmaj7 → Em7 → Am7 → D7",
    tags: ["bright", "morning", "bossa"],
    code: `setcpm(39)

stack(
  s("bd ~ ~ ~ [~ bd] ~ ~ ~")
    .gain(0.78)
    .lpf(4000),

  s("~ ~ <sd rim> ~ ~ ~ <sd rim> ~")
    .gain(0.62)
    .room(0.16),

  s("[hh [~ hh]]*4")
    .gain(0.3)
    .hpf(6000)
    .pan(0.6),

  note("g2 ~ d3 ~ ~ ~  e2 ~ b2 ~ ~ ~  a2 ~ e3 ~ ~ ~  d2 ~ a2 ~ cs3 ~")
    .sound("sawtooth")
    .lpf(500)
    .attack(0.006).decay(0.1).sustain(0.5).release(0.08)
    .gain(0.6)
    .slow(3),

  note("<[g3,b3,d4,fs4] [e4,g4,b4,d5] [a3,c4,e4,g4] [d4,fs4,a4,c5]>")
    .sound("sawtooth")
    .attack(0.05)
    .release(0.4)
    .lpf(2400)
    .room(0.3)
    .gain(0.3)
    .pan(0.44)
    .slow(2),

  note("b4 ~ d5 ~ e5 d5 ~ b4  ~ a4 ~ ~ g4 ~ ~ b4")
    .sound("sine")
    .attack(0.018)
    .release(0.3)
    .delay(0.38)
    .delaytime(0.333)
    .delayfeedback(0.2)
    .room(0.42)
    .gain(0.5)
    .pan(0.5)
    .slow(2)
)`
  },
  {
    id: "song-06",
    title: "Harbour Fog",
    subtitle: "Lo-fi jazz",
    key: "Eb Dorian",
    bpm: 75,
    feel: "Fog rolling in off the water, a harbour at 4am, shapes disappearing into grey",
    chords: "Ebm9 → Abm9 → Dbmaj9 → Bbm7",
    tags: ["mysterious", "modal", "spacious"],
    code: `setcpm(38)

stack(
  s("bd ~ ~ ~ ~ ~ ~ ~")
    .gain(0.75)
    .room(0.18)
    .size(0.5),

  s("[hh [~ hh]]*4")
    .gain(0.22)
    .hpf(9000)
    .pan(0.6)
    .room(0.1),

  s("oh/2")
    .gain(0.42)
    .hpf(5000)
    .room(0.3)
    .pan(0.55),

  note("eb2 ~ ab2 ~ ~ ~  ab2 ~ eb3 ~ ~ ~  db2 ~ ab2 ~ ~ ~  bb2 ~ f3 ~ ~ ~")
    .sound("sawtooth")
    .lpf(380)
    .attack(0.04).decay(0.2).sustain(0.6).release(0.3)
    .gain(0.6)
    .slow(3),

  note("<[eb4,bb4,db5,f5] [ab3,eb4,gb4,bb4] [db4,ab4,c5,eb5] [bb3,f4,ab4]>")
    .sound("sawtooth")
    .attack(0.18)
    .release(1.2)
    .lpf(1600)
    .room(0.75)
    .size(0.9)
    .gain(0.26)
    .pan(0.4)
    .slow(2),

  note("<[eb5,bb5] [ab4,eb5] [db5,ab5] [bb4,f5]>")
    .sound("sawtooth")
    .attack(1.0)
    .release(2.0)
    .lpf(1000)
    .room(0.9)
    .size(0.95)
    .gain(0.12)
    .pan(0.6)
    .slow(4),

  note("bb4 ~ ~ ~ gb4 ~ ~ ~ eb5 ~ ~ ~ db5 ~ ~ ~")
    .sound("triangle")
    .attack(0.04)
    .release(0.5)
    .delay(0.5)
    .delaytime(0.375)
    .delayfeedback(0.38)
    .room(0.7)
    .size(0.8)
    .gain(0.46)
    .pan(0.52)
    .slow(2)
)`
  },
  {
    id: "song-07",
    title: "Golden Afternoon",
    subtitle: "Lo-fi jazz",
    key: "A major",
    bpm: 84,
    feel: "Late afternoon, golden hour, a garden in summer — the kind of day you only realise was perfect in hindsight",
    chords: "Amaj7 → F#m7 → Bm7 → E7",
    tags: ["warm", "nostalgic", "afternoon"],
    code: `setcpm(42)

stack(
  s("bd ~ ~ ~ bd ~ ~ ~")
    .gain(0.8)
    .lpf(4500),

  s("~ ~ <sd cp> ~ ~ ~ <sd cp> ~")
    .gain(0.68)
    .room(0.14),

  s("[hh [~ hh]]*4")
    .gain(0.32)
    .hpf(5000)
    .pan(0.62),

  s("~ ~ ~ ~ oh ~ ~ ~")
    .gain(0.5)
    .pan(0.57),

  note("a2 cs3 e3 gs3  fs2 a2 cs3 e3  b2 d3 fs3 a3  e2 gs2 b2 d3")
    .sound("sawtooth")
    .lpf(480)
    .attack(0.007).decay(0.12).sustain(0.45).release(0.08)
    .gain(0.62),

  note("<[a3,cs4,e4,gs4] [fs3,a3,cs4,e4] [b3,d4,fs4,a4] [e4,gs4,b4,d5]>")
    .sound("sawtooth")
    .attack(0.055)
    .release(0.45)
    .lpf(2500)
    .room(0.32)
    .gain(0.29)
    .pan(0.43)
    .slow(2),

  note("cs5 ~ e5 ~ a4 ~ cs5 ~  b4 ~ ~ cs5 ~ ~ a4 ~")
    .sound("triangle")
    .attack(0.015)
    .release(0.28)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.2)
    .room(0.38)
    .gain(0.5)
    .pan(0.52)
    .slow(2)
)`
  },
  {
    id: "song-08",
    title: "Neon Puddles",
    subtitle: "Lo-fi jazz",
    key: "A Dorian",
    bpm: 72,
    feel: "Rain-slicked streets, neon signs blurred in puddles, something bittersweet in the air",
    chords: "Am9 → Dm9 → G13 → Cmaj9",
    tags: ["urban", "dorian", "night"],
    code: `setcpm(36)

stack(
  s("bd ~ ~ ~ bd ~ ~ ~")
    .gain(0.8)
    .lpf(2500)
    .room(0.2)
    .size(0.3)
    .distort(0.06),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.66)
    .room(0.12),

  s("[hh [~ hh]]*4")
    .gain(0.26)
    .lpf(10000)
    .pan(0.64),

  note("a2 ~ e3 ~ ~ ~  d2 ~ a2 ~ ~ ~  g2 ~ d3 ~ ~ ~  c2 ~ g2 ~ ~ ~")
    .sound("sawtooth")
    .lpf(420)
    .attack(0.006).decay(0.13).sustain(0.45).release(0.09)
    .gain(0.63)
    .slow(3),

  note("<[a3,e4,g4,b4] [d4,a4,c5,e5] [g3,b3,f4,e5] [c4,g4,b4,d5]>")
    .sound("sawtooth")
    .attack(0.06)
    .release(0.5)
    .lpf(2000)
    .room(0.4)
    .gain(0.27)
    .pan(0.42)
    .slow(2),

  note("e4 ~ ~ d4 ~ ~ c4 ~ ~ ~ ~ fs3 ~ ~ g3 ~")
    .sound("sawtooth")
    .attack(0.02).release(0.25)
    .lpf(1500)
    .room(0.3)
    .gain(0.28)
    .pan(0.38)
    .slow(2),

  note("a4 ~ c5 ~ e5 ~ fs5 e5  ~ d5 ~ ~ c5 ~ ~ a4")
    .sound("sine")
    .attack(0.014)
    .release(0.32)
    .delay(0.42)
    .delaytime(0.375)
    .delayfeedback(0.27)
    .room(0.52)
    .gain(0.48)
    .pan(0.54)
    .slow(2)
)`
  }
];
