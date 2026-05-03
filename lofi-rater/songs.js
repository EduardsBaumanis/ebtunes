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
  },
  {
    id: "song-09",
    title: "Midnight Thoughts",
    subtitle: "Lo-fi jazz / introspective",
    key: "A minor",
    bpm: 75,
    feel: "Desk lamp glow, notebook pages, thoughts flowing",
    chords: "Am7 → Dm7 → G7 → Cmaj7",
    tags: ["introspective", "night", "jazz", "slow"],
    code: `setcpm(26)

stack(

  s("bd ~ ~ ~ ~ bd ~ ~")
    .gain(0.8)
    .lpf(3400),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.66)
    .room(0.13),

  s("[hh [~ hh]]*4")
    .gain(0.28)
    .lpf(8200)
    .room(0.1)
    .pan(0.58),

  s("~ ~ ~ oh ~ ~ ~ ~")
    .gain(0.42)
    .pan(0.55),

  note("a2 c3 e3 g3  d3 f3 a3 c4  g2 b2 d3 f3  c3 e3 g3 b3")
    .sound("sawtooth")
    .lpf(200)
    .attack(0.008).decay(0.12).sustain(0.45).release(0.08)
    .gain(0.64),

  note("<[a3,c4,e4,g4] [d4,f4,a4,c5] [g3,b3,d4,f4] [c4,e4,g4,b4]>")
    .sound("sawtooth")
    .attack(0.07)
    .release(0.5)
    .lpf(2100)
    .room(0.35)
    .gain(0.26)
    .pan(0.42)
    .slow(2),

  note("a4 ~ c5 ~ d5 ~ e5 ~  ~ g4 ~ ~ a4 ~ c5 ~")
    .sound("triangle")
    .attack(0.015)
    .release(0.32)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.22)
    .room(0.48)
    .gain(0.48)
    .pan(0.51)
    .slow(2)

)`
  },
  {
    id: "song-10",
    title: "Lazy Afternoon",
    subtitle: "Lo-fi bossa nova",
    key: "Bb major",
    bpm: 84,
    feel: "Hammock swaying, distant birds, golden hour fading",
    chords: "Bbmaj7 → Gm7 → Cm7 → F7",
    tags: ["bossa nova", "warm", "carefree", "afternoon"],
    code: `setcpm(17)

stack(

  s("bd").euclid(3, 8)
    .gain(0.77)
    .lpf(4100),

  s("~ ~ <sd cp> ~ ~ ~ <sd cp> ~")
    .gain(0.64)
    .room(0.12),

  s("hh").euclid(5, 8)
    .gain(0.32)
    .hpf(5800)
    .room(0.12)
    .pan(0.64),

  s("oh/2")
    .gain(0.4)
    .hpf(5200)
    .pan(0.58),

  note("bb2 ~ ~ f3 ~ ~ ~ ~  g2 ~ ~ d3 ~ ~ ~ ~  c2 ~ ~ g2 ~ ~ ~ ~  f2 ~ ~ c3 ~ ~ ~ ~")
    .sound("sawtooth")
    .lpf(260)
    .attack(0.007).decay(0.11).sustain(0.48).release(0.09)
    .gain(0.62)
    .slow(4),

  note("<[bb3,d4,f4,a4] [g3,bb3,d4,f4] [c4,eb4,g4,bb4] [f3,a3,c4,eb4]>")
    .sound("sawtooth")
    .attack(0.025)
    .decay(0.13)
    .sustain(0.42)
    .release(0.38)
    .lpf(2500)
    .room(0.26)
    .gain(0.34)
    .pan(0.41)
    .slow(2),

  note("<[bb3,d4,f4] [g3,bb3,d4] [c3,eb3,g3] [f3,a3,c4]>")
    .sound("sine")
    .attack(0.15)
    .release(0.8)
    .lpf(1200)
    .room(0.45)
    .gain(0.15)
    .slow(4),

  note("d5 ~ f5 ~ g5 f5 ~ d5  ~ c5 ~ ~ bb4 ~ ~ d5")
    .sound("sine")
    .attack(0.02)
    .release(0.32)
    .delay(0.38)
    .delaytime(0.333)
    .delayfeedback(0.19)
    .room(0.4)
    .gain(0.52)
    .pan(0.49)
    .slow(2)

)`
  },
  {
    id: "song-11",
    title: "Rainy Window",
    subtitle: "Lo-fi jazz / melancholic",
    key: "E minor",
    bpm: 70,
    feel: "Water droplets on glass, coffee cooling, solitude",
    chords: "Em7 → Am7 → D7 → Gmaj7",
    tags: ["rain", "melancholic", "slow", "introspective"],
    code: `setcpm(25)

stack(

  s("bd ~ ~ ~ ~ ~ bd ~")
    .gain(0.84)
    .lpf(3100),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.65)
    .room(0.16),

  s("[hh [~ hh]]*4")
    .gain(0.26)
    .lpf(8000)
    .room(0.11)
    .pan(0.61),

  s("~ ~ ~ ~ ~ oh ~ ~")
    .gain(0.45)
    .pan(0.54),

  note("e2 g2 b2 d3  a2 c3 e3 g3  d3 fs3 a3 c4  g2 b2 d3 fs3")
    .sound("sawtooth")
    .lpf(190)
    .attack(0.01).decay(0.14).sustain(0.5).release(0.1)
    .gain(0.66),

  note("<[e3,g3,b3,d4] [a3,c4,e4,g4] [d3,fs3,a3,c4] [g3,b3,d4,fs4]>")
    .sound("sawtooth")
    .attack(0.08)
    .release(0.55)
    .lpf(1950)
    .room(0.38)
    .gain(0.24)
    .pan(0.44)
    .slow(2),

  note("e5 ~ ~ b4 ~ g4 ~ ~  ~ ~ d4 ~ a4 ~ ~ b4")
    .sound("triangle")
    .attack(0.018)
    .release(0.38)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.26)
    .room(0.5)
    .gain(0.46)
    .pan(0.52)
    .slow(2)

)`
  },
  {
    id: "song-12",
    title: "Morning Stroll",
    subtitle: "Lo-fi jazz / bright",
    key: "D major",
    bpm: 80,
    feel: "Fresh air, birds singing, the city waking up",
    chords: "Dmaj7 → Bm7 → Em7 → A7",
    tags: ["morning", "bright", "optimistic", "walk"],
    code: `setcpm(28)

stack(

  s("bd ~ ~ bd ~ bd ~ ~")
    .gain(0.79)
    .lpf(4200),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.68)
    .room(0.11),

  s("[hh [~ hh]]*4")
    .gain(0.34)
    .hpf(6100)
    .room(0.09)
    .pan(0.62),

  s("~ ~ ~ oh ~ ~ ~ ~")
    .gain(0.44)
    .hpf(5500)
    .pan(0.56),

  note("d2 ~ a2 ~ ~ ~  b2 ~ fs3 ~ ~ ~  e2 ~ b2 ~ ~ ~  a2 ~ e3 ~ ~ ~")
    .sound("sawtooth")
    .lpf(280)
    .attack(0.006).decay(0.09).sustain(0.45).release(0.07)
    .gain(0.62)
    .slow(3),

  note("<[d4,fs4,a4,cs5] [b3,d4,fs4,a4] [e4,g4,b4,d5] [a3,cs4,e4,g4]>")
    .sound("sawtooth")
    .attack(0.04)
    .release(0.36)
    .lpf(2600)
    .room(0.27)
    .gain(0.32)
    .pan(0.43)
    .slow(2),

  note("<[d3,fs3,a3] [b3,d4,fs4] [e3,g3,b3] [a3,cs4,e4]>")
    .sound("sine")
    .attack(0.12)
    .release(0.7)
    .lpf(1300)
    .room(0.42)
    .gain(0.16)
    .slow(4),

  note("fs5 ~ a5 ~ b5 a5 ~ fs5  ~ e5 ~ ~ d5 ~ ~ fs5")
    .sound("sine")
    .attack(0.017)
    .release(0.28)
    .delay(0.38)
    .delaytime(0.333)
    .delayfeedback(0.18)
    .room(0.36)
    .gain(0.54)
    .pan(0.5)
    .slow(2)

)`
  },
  {
    id: "song-13",
    title: "Evening Reflections",
    subtitle: "Lo-fi jazz / sunset",
    key: "Ab major",
    bpm: 77,
    feel: "Watching the sun go down, everything turns gold",
    chords: "Abmaj7 → Fm7 → Bbm7 → Eb7",
    tags: ["evening", "peaceful", "warm", "contemplative"],
    code: `setcpm(27)

stack(

  s("bd ~ ~ ~ bd ~ ~ ~")
    .gain(0.81)
    .lpf(3800),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.67)
    .room(0.14),

  s("[hh [~ hh]]*4")
    .gain(0.31)
    .lpf(8000)
    .room(0.1)
    .pan(0.59),

  s("~ ~ ~ ~ ~ ~ ~ oh")
    .gain(0.46)
    .pan(0.57),

  note("ab2 c3 eb3 g3  f3 ab3 c4 eb4  bb2 db3 f3 ab3  eb3 g3 bb3 db4")
    .sound("sawtooth")
    .lpf(210)
    .attack(0.009).decay(0.13).sustain(0.48).release(0.09)
    .gain(0.63),

  note("<[ab3,c4,eb4,g4] [f3,ab3,c4,eb4] [bb3,db4,f4,ab4] [eb3,g3,bb3,db4]>")
    .sound("sawtooth")
    .attack(0.07)
    .release(0.52)
    .lpf(2050)
    .room(0.36)
    .gain(0.27)
    .pan(0.42)
    .slow(2),

  note("c5 ~ eb5 ~ f5 ~ ab5 ~  ~ g4 ~ ~ f4 ~ eb5 ~")
    .sound("triangle")
    .attack(0.016)
    .release(0.34)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.24)
    .room(0.46)
    .gain(0.47)
    .pan(0.51)
    .slow(2)

)`
  },
  {
    id: "song-14",
    title: "Sunrise Hope",
    subtitle: "Lo-fi jazz / optimistic",
    key: "E major",
    bpm: 82,
    feel: "Golden morning light breaking through clouds",
    chords: "Emaj7 → C#m7 → F#m7 → B7",
    tags: ["morning", "hopeful", "bright", "uplifting"],
    code: `setcpm(28)

stack(

  s("bd ~ ~ bd bd ~ ~ ~")
    .gain(0.78)
    .lpf(4300),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.69)
    .room(0.1),

  s("[hh [~ hh]]*4")
    .gain(0.36)
    .hpf(6500)
    .room(0.08)
    .pan(0.61),

  s("~ ~ oh ~ ~ ~ ~ oh")
    .gain(0.48)
    .hpf(6000)
    .pan(0.59),

  note("e2 ~ b2 ~ ~ ~  cs3 ~ gs3 ~ ~ ~  fs2 ~ cs3 ~ ~ ~  b2 ~ fs3 ~ ~ ~")
    .sound("sawtooth")
    .lpf(290)
    .attack(0.006).decay(0.1).sustain(0.44).release(0.08)
    .gain(0.64)
    .slow(3),

  note("<[e4,gs4,b4,ds5] [cs4,e4,gs4,b4] [fs4,a4,cs5,e5] [b3,ds4,fs4,a4]>")
    .sound("sawtooth")
    .attack(0.03)
    .release(0.35)
    .lpf(2700)
    .room(0.24)
    .gain(0.34)
    .pan(0.44)
    .slow(2),

  note("<[e3,gs3,b3] [cs4,e4,gs4] [fs3,a3,cs4] [b3,ds4,fs4]>")
    .sound("sine")
    .attack(0.1)
    .release(0.65)
    .lpf(1400)
    .room(0.38)
    .gain(0.17)
    .slow(4),

  note("gs5 ~ b5 ~ cs6 b5 ~ gs5  ~ fs5 ~ ~ e5 ~ ~ gs5")
    .sound("sine")
    .attack(0.015)
    .release(0.26)
    .delay(0.38)
    .delaytime(0.333)
    .delayfeedback(0.17)
    .room(0.33)
    .gain(0.56)
    .pan(0.5)
    .slow(2)

)`
  },
  {
    id: "song-15",
    title: "Night Whispers",
    subtitle: "Lo-fi jazz / deep night",
    key: "B minor",
    bpm: 72,
    feel: "Thoughts wandering in the dark, everything still",
    chords: "Bm7 → Em7 → A7 → Dmaj7",
    tags: ["night", "dark", "introspective", "solitude"],
    code: `setcpm(25)

stack(

  s("bd ~ ~ ~ ~ ~ bd ~")
    .gain(0.85)
    .lpf(2900),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.62)
    .room(0.18),

  s("[hh [~ hh]]*4")
    .gain(0.24)
    .lpf(8000)
    .room(0.12)
    .pan(0.63),

  s("~ ~ ~ ~ ~ ~ oh ~")
    .gain(0.4)
    .pan(0.56),

  note("b2 d3 fs3 a3  e2 g2 b2 d3  a2 cs3 e3 g3  d3 fs3 a3 cs4")
    .sound("sawtooth")
    .lpf(185)
    .attack(0.012).decay(0.15).sustain(0.5).release(0.11)
    .gain(0.67),

  note("<[b3,d4,fs4,a4] [e3,g3,b3,d4] [a3,cs4,e4,g4] [d3,fs3,a3,cs4]>")
    .sound("sawtooth")
    .attack(0.09)
    .release(0.56)
    .lpf(1900)
    .room(0.4)
    .gain(0.23)
    .pan(0.41)
    .slow(2),

  note("fs5 ~ ~ d4 ~ a4 ~ ~  ~ ~ b4 ~ e5 ~ ~ fs4")
    .sound("triangle")
    .attack(0.02)
    .release(0.4)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.27)
    .room(0.52)
    .gain(0.44)
    .pan(0.52)
    .slow(2)

)`
  },
  {
    id: "song-16",
    title: "Dark Dreams",
    subtitle: "Lo-fi jazz / hypnotic",
    key: "F# minor",
    bpm: 68,
    feel: "Drifting consciousness, shadows lengthening, unease",
    chords: "F#m7 → Bm7 → E7 → Amaj7",
    tags: ["dark", "hypnotic", "moody", "slow"],
    code: `setcpm(24)

stack(

  s("bd ~ ~ ~ ~ bd ~ ~")
    .gain(0.86)
    .lpf(2700),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.61)
    .room(0.2),

  s("[hh [~ hh]]*4")
    .gain(0.22)
    .lpf(7800)
    .room(0.13)
    .pan(0.64),

  s("~ ~ ~ ~ oh ~ ~ oh")
    .gain(0.38)
    .pan(0.54),

  note("fs2 a2 cs3 e3  b2 d3 fs3 a3  e3 gs3 b3 d4  a2 cs3 e3 gs3")
    .sound("sawtooth")
    .lpf(175)
    .attack(0.014).decay(0.16).sustain(0.52).release(0.12)
    .gain(0.69),

  note("<[fs3,a3,cs4,e4] [b3,d4,fs4,a4] [e3,gs3,b3,d4] [a3,cs4,e4,gs4]>")
    .sound("sawtooth")
    .attack(0.1)
    .release(0.6)
    .lpf(1800)
    .room(0.44)
    .gain(0.21)
    .pan(0.4)
    .slow(2),

  note("cs5 ~ ~ e4 ~ b4 ~ ~  ~ ~ fs4 ~ a4 ~ ~ b4")
    .sound("triangle")
    .attack(0.022)
    .release(0.42)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.29)
    .room(0.54)
    .gain(0.42)
    .pan(0.53)
    .slow(2)

)`
  },
  {
    id: "song-17",
    title: "Quiet Streets",
    subtitle: "Lo-fi jazz / late night",
    key: "G minor",
    bpm: 74,
    feel: "Empty sidewalks, streetlights, the city sleeping",
    chords: "Gm7 → Cm7 → F7 → Bbmaj7",
    tags: ["night", "urban", "solitude", "quiet"],
    code: `setcpm(26)

stack(

  s("bd ~ ~ ~ bd ~ ~ ~")
    .gain(0.83)
    .lpf(3500),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.66)
    .room(0.15),

  s("[hh [~ hh]]*4")
    .gain(0.29)
    .lpf(8200)
    .room(0.1)
    .pan(0.6),

  s("~ ~ ~ ~ ~ oh ~ ~")
    .gain(0.43)
    .pan(0.55),

  note("g2 bb2 d3 f3  c3 eb3 g3 bb3  f2 a2 c3 eb3  bb2 d3 f3 a3")
    .sound("sawtooth")
    .lpf(195)
    .attack(0.009).decay(0.13).sustain(0.46).release(0.09)
    .gain(0.65),

  note("<[g3,bb3,d4,f4] [c3,eb3,g3,bb3] [f3,a3,c4,eb4] [bb3,d4,f4,a4]>")
    .sound("sawtooth")
    .attack(0.075)
    .release(0.48)
    .lpf(2000)
    .room(0.34)
    .gain(0.25)
    .pan(0.43)
    .slow(2),

  note("d5 ~ f5 ~ bb4 ~ g4 ~  ~ c5 ~ ~ d5 ~ f5 ~")
    .sound("triangle")
    .attack(0.016)
    .release(0.33)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.23)
    .room(0.49)
    .gain(0.47)
    .pan(0.51)
    .slow(2)

)`
  },
  {
    id: "song-18",
    title: "Summer Breeze",
    subtitle: "Lo-fi bossa nova / tropical",
    key: "C major",
    bpm: 80,
    feel: "Lazy afternoon by the sea, time stands still",
    chords: "Cmaj7 → Am7 → Dm7 → G7",
    tags: ["bossa nova", "summer", "carefree", "warm"],
    code: `setcpm(28)

stack(

  s("bd").euclid(3, 8)
    .gain(0.76)
    .lpf(4200),

  s("~ ~ <sd cp> ~ ~ ~ <sd cp> ~")
    .gain(0.63)
    .room(0.13),

  s("hh").euclid(5, 8)
    .gain(0.33)
    .hpf(5500)
    .room(0.12)
    .pan(0.62),

  s("oh/2")
    .gain(0.39)
    .hpf(5100)
    .pan(0.59),

  note("c2 ~ ~ g2 ~ ~ ~ ~  a2 ~ ~ e3 ~ ~ ~ ~  d2 ~ ~ a2 ~ ~ ~ ~  g2 ~ ~ d3 ~ ~ ~ ~")
    .sound("sawtooth")
    .lpf(260)
    .attack(0.007).decay(0.11).sustain(0.47).release(0.09)
    .gain(0.61)
    .slow(4),

  note("<[c4,e4,g4,b4] [a3,c4,e4,g4] [d4,f4,a4,c5] [g3,b3,d4,f4]>")
    .sound("sawtooth")
    .attack(0.023)
    .decay(0.14)
    .sustain(0.43)
    .release(0.39)
    .lpf(2450)
    .room(0.28)
    .gain(0.33)
    .pan(0.42)
    .slow(2),

  note("<[c3,e3,g3] [a3,c4,e4] [d3,f3,a3] [g3,b3,d4]>")
    .sound("sine")
    .attack(0.14)
    .release(0.75)
    .lpf(1250)
    .room(0.43)
    .gain(0.16)
    .slow(4),

  note("e5 ~ g5 ~ a5 g5 ~ e5  ~ d5 ~ ~ c5 ~ ~ e5")
    .sound("sine")
    .attack(0.02)
    .release(0.31)
    .delay(0.38)
    .delaytime(0.333)
    .delayfeedback(0.2)
    .room(0.41)
    .gain(0.51)
    .pan(0.49)
    .slow(2)

)`
  },
  {
    id: "song-19",
    title: "Velvet Night",
    subtitle: "Lo-fi jazz / intimate",
    key: "Db major",
    bpm: 76,
    feel: "Candlelight, silk textures, whispered conversations",
    chords: "Dbmaj7 → Bbm7 → Ebm7 → Ab7",
    tags: ["night", "intimate", "warm", "sensual"],
    code: `setcpm(27)

stack(

  s("bd ~ bd ~ bd ~ ~ ~")
    .gain(0.8)
    .lpf(3900),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.67)
    .room(0.15),

  s("[hh [~ hh]]*4")
    .gain(0.32)
    .lpf(8000)
    .room(0.11)
    .pan(0.58),

  s("~ ~ ~ ~ ~ ~ oh ~")
    .gain(0.44)
    .pan(0.56),

  note("db2 f2 ab2 c3  bb2 db3 f3 ab3  eb2 gb2 bb2 db3  ab2 c3 eb3 gb3")
    .sound("sawtooth")
    .lpf(205)
    .attack(0.01).decay(0.13).sustain(0.49).release(0.1)
    .gain(0.64),

  note("<[db3,f3,ab3,c4] [bb3,db4,f4,ab4] [eb3,gb3,bb3,db4] [ab3,c4,eb4,gb4]>")
    .sound("sawtooth")
    .attack(0.07)
    .release(0.5)
    .lpf(2150)
    .room(0.37)
    .gain(0.26)
    .pan(0.41)
    .slow(2),

  note("f5 ~ ab5 ~ bb5 ~ db5 ~  ~ eb5 ~ ~ f5 ~ ab5 ~")
    .sound("triangle")
    .attack(0.017)
    .release(0.35)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.25)
    .room(0.47)
    .gain(0.46)
    .pan(0.52)
    .slow(2)

)`
  },
  {
    id: "song-20",
    title: "Coffee Shop Afternoon",
    subtitle: "Lo-fi jazz / focused",
    key: "A major",
    bpm: 83,
    feel: "Espresso steam, keyboard clicks, productivity flow",
    chords: "Amaj7 → F#m7 → Bm7 → E7",
    tags: ["afternoon", "focused", "cozy", "bright"],
    code: `setcpm(29)

stack(

  s("bd ~ ~ bd ~ bd ~ ~")
    .gain(0.77)
    .lpf(4400),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.7)
    .room(0.09),

  s("[hh [~ hh]]*4")
    .gain(0.35)
    .hpf(6300)
    .room(0.09)
    .pan(0.61),

  s("~ ~ oh ~ ~ ~ ~ oh")
    .gain(0.47)
    .hpf(5800)
    .pan(0.58),

  note("a2 ~ e3 ~ ~ ~  fs3 ~ cs4 ~ ~ ~  b2 ~ fs3 ~ ~ ~  e3 ~ b3 ~ ~ ~")
    .sound("sawtooth")
    .lpf(300)
    .attack(0.006).decay(0.1).sustain(0.43).release(0.08)
    .gain(0.63)
    .slow(3),

  note("<[a4,cs5,e5,gs5] [fs4,a4,cs5,e5] [b3,d4,fs4,a4] [e4,gs4,b4,d5]>")
    .sound("sawtooth")
    .attack(0.032)
    .release(0.34)
    .lpf(2800)
    .room(0.22)
    .gain(0.35)
    .pan(0.45)
    .slow(2),

  note("<[a3,cs4,e4] [fs4,a4,cs5] [b3,d4,fs4] [e4,gs4,b4]>")
    .sound("sine")
    .attack(0.11)
    .release(0.62)
    .lpf(1450)
    .room(0.35)
    .gain(0.18)
    .slow(4),

  note("cs5 ~ e5 ~ fs5 e5 ~ cs5  ~ b4 ~ ~ a4 ~ ~ cs5")
    .sound("sine")
    .attack(0.014)
    .release(0.27)
    .delay(0.38)
    .delaytime(0.333)
    .delayfeedback(0.19)
    .room(0.32)
    .gain(0.55)
    .pan(0.5)
    .slow(2)

)`
  },
  {
    id: "song-21",
    title: "Winter Silence",
    subtitle: "Lo-fi jazz / cold stillness",
    key: "C# minor",
    bpm: 71,
    feel: "Snowflakes falling slowly, world muffled in white",
    chords: "C#m7 → F#m7 → B7 → Emaj7",
    tags: ["winter", "cold", "slow", "melancholic"],
    code: `setcpm(25)

stack(

  s("bd ~ ~ ~ ~ ~ bd ~")
    .gain(0.87)
    .lpf(2800),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.61)
    .room(0.19),

  s("[hh [~ hh]]*4")
    .gain(0.25)
    .lpf(7800)
    .room(0.13)
    .pan(0.62),

  s("~ ~ ~ ~ ~ ~ oh oh")
    .gain(0.41)
    .pan(0.55),

  note("cs2 e2 gs2 b2  fs2 a2 cs3 e3  b2 ds3 fs3 a3  e3 gs3 b3 ds4")
    .sound("sawtooth")
    .lpf(180)
    .attack(0.013).decay(0.16).sustain(0.51).release(0.12)
    .gain(0.68),

  note("<[cs3,e3,gs3,b3] [fs3,a3,cs4,e4] [b3,ds4,fs4,a4] [e3,gs3,b3,ds4]>")
    .sound("sawtooth")
    .attack(0.09)
    .release(0.58)
    .lpf(1850)
    .room(0.41)
    .gain(0.22)
    .pan(0.39)
    .slow(2),

  note("gs4 ~ ~ b4 ~ e5 ~ ~  ~ ~ cs4 ~ fs4 ~ ~ gs4")
    .sound("triangle")
    .attack(0.021)
    .release(0.41)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.28)
    .room(0.51)
    .gain(0.43)
    .pan(0.53)
    .slow(2)

)`
  },
  {
    id: "song-22",
    title: "Ocean Drift",
    subtitle: "Lo-fi bossa nova / aquatic",
    key: "F major",
    bpm: 75,
    feel: "Waves lapping, driftwood floating, tidal rhythm",
    chords: "Fmaj7 → Dm7 → Gm7 → C7",
    tags: ["bossa nova", "ocean", "flowing", "hypnotic"],
    code: `setcpm(26)

stack(

  s("bd").euclid(3, 8)
    .gain(0.78)
    .lpf(3900),

  s("~ ~ <sd rim> ~ ~ ~ <sd rim> ~")
    .gain(0.65)
    .room(0.14),

  s("hh").euclid(5, 8)
    .gain(0.31)
    .hpf(5200)
    .room(0.14)
    .pan(0.63),

  s("oh/2")
    .gain(0.41)
    .hpf(5300)
    .pan(0.57),

  note("f2 ~ ~ c3 ~ ~ ~ ~  d2 ~ ~ a2 ~ ~ ~ ~  g2 ~ ~ d3 ~ ~ ~ ~  c2 ~ ~ g2 ~ ~ ~ ~")
    .sound("sawtooth")
    .lpf(250)
    .attack(0.008).decay(0.12).sustain(0.46).release(0.09)
    .gain(0.6)
    .slow(4),

  note("<[f4,a4,c5,e5] [d4,f4,a4,c5] [g4,bb4,d5,f5] [c4,e4,g4,bb4]>")
    .sound("sawtooth")
    .attack(0.026)
    .decay(0.12)
    .sustain(0.41)
    .release(0.37)
    .lpf(2300)
    .room(0.3)
    .gain(0.32)
    .pan(0.42)
    .slow(2),

  note("<[f3,a3,c4] [d3,f3,a3] [g3,bb3,d4] [c3,e3,g3]>")
    .sound("sine")
    .attack(0.16)
    .release(0.8)
    .lpf(1200)
    .room(0.46)
    .gain(0.14)
    .slow(4),

  note("a5 ~ c6 ~ d5 c5 ~ a5  ~ g5 ~ ~ f5 ~ ~ a5")
    .sound("sine")
    .attack(0.024)
    .release(0.33)
    .delay(0.38)
    .delaytime(0.333)
    .delayfeedback(0.21)
    .room(0.44)
    .gain(0.49)
    .pan(0.49)
    .slow(2)

)`
  },
  {
    id: "song-23",
    title: "Urban Solitude",
    subtitle: "Lo-fi jazz / city night",
    key: "Eb minor",
    bpm: 73,
    feel: "Surrounded by millions, completely alone",
    chords: "Ebm7 → Abm7 → Db7 → Gbmaj7",
    tags: ["urban", "night", "solitude", "melancholic"],
    code: `setcpm(26)

stack(

  s("bd ~ ~ ~ bd ~ ~ ~")
    .gain(0.84)
    .lpf(3600),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.68)
    .room(0.12),

  s("[hh [~ hh]]*4")
    .gain(0.33)
    .lpf(8100)
    .room(0.1)
    .pan(0.59),

  s("~ ~ ~ oh ~ ~ ~ ~")
    .gain(0.45)
    .pan(0.54),

  note("eb2 gb2 bb2 db3  ab2 cb3 eb3 gb3  db3 f3 ab3 cb4  gb2 bb2 db3 f3")
    .sound("sawtooth")
    .lpf(190)
    .attack(0.011).decay(0.14).sustain(0.5).release(0.11)
    .gain(0.66),

  note("<[eb3,gb3,bb3,db4] [ab3,cb4,eb4,gb4] [db3,f3,ab3,cb4] [gb3,bb3,db4,f4]>")
    .sound("sawtooth")
    .attack(0.08)
    .release(0.53)
    .lpf(1950)
    .room(0.36)
    .gain(0.24)
    .pan(0.42)
    .slow(2),

  note("ab4 ~ bb4 ~ db5 ~ eb5 ~  ~ gb4 ~ ~ ab4 ~ bb4 ~")
    .sound("triangle")
    .attack(0.018)
    .release(0.36)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.26)
    .room(0.48)
    .gain(0.45)
    .pan(0.52)
    .slow(2)

)`
  },
  {
    id: "song-24",
    title: "Starlight Garden",
    subtitle: "Lo-fi jazz / ethereal",
    key: "A minor",
    bpm: 69,
    feel: "Fireflies dancing, flowers glowing, night magic",
    chords: "Am7 → Dm7 → G7 → Cmaj7",
    tags: ["dreamy", "night", "ethereal", "slow"],
    code: `setcpm(24)

stack(

  s("bd ~ ~ ~ ~ ~ bd ~")
    .gain(0.82)
    .lpf(2600),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.62)
    .room(0.22),

  s("[hh [~ hh]]*4")
    .gain(0.23)
    .lpf(7900)
    .room(0.12)
    .pan(0.6),

  s("~ ~ ~ ~ ~ oh ~ oh")
    .gain(0.39)
    .pan(0.55),

  note("a2 c3 e3 g3  d3 f3 a3 c4  g2 b2 d3 f3  c3 e3 g3 b3")
    .sound("sawtooth")
    .lpf(180)
    .attack(0.015).decay(0.16).sustain(0.52).release(0.13)
    .gain(0.67),

  note("<[a2,c3,e3,g3] [d3,f3,a3,c4] [g2,b2,d3,f3] [c3,e3,g3,b3]>")
    .sound("sawtooth")
    .attack(0.14)
    .release(0.7)
    .lpf(1700)
    .room(0.5)
    .gain(0.19)
    .pan(0.4)
    .slow(4),

  note("e5 ~ ~ g4 ~ c5 ~ ~  ~ ~ a4 ~ d5 ~ ~ e5")
    .sound("triangle")
    .attack(0.025)
    .release(0.44)
    .delay(0.38)
    .delaytime(0.375)
    .delayfeedback(0.3)
    .room(0.54)
    .gain(0.4)
    .pan(0.51)
    .slow(2)

)`
  },
  {
    id: "song-25",
    title: "Autumn Leaves",
    subtitle: "Lo-fi jazz / nostalgic",
    key: "B major",
    bpm: 79,
    feel: "Walking through fallen leaves, time passing softly",
    chords: "Bmaj7 → G#m7 → C#m7 → F#7",
    tags: ["autumn", "nostalgic", "warm", "wistful"],
    code: `setcpm(27)

stack(

  s("bd ~ ~ bd ~ bd ~ ~")
    .gain(0.79)
    .lpf(4100),

  s("~ ~ sd ~ ~ ~ sd ~")
    .gain(0.69)
    .room(0.11),

  s("[hh [~ hh]]*4")
    .gain(0.34)
    .hpf(6200)
    .room(0.09)
    .pan(0.6),

  s("~ ~ ~ oh ~ ~ ~ ~")
    .gain(0.46)
    .hpf(5600)
    .pan(0.57),

  note("b2 ~ fs3 ~ ~ ~  gs3 ~ ds4 ~ ~ ~  cs3 ~ gs3 ~ ~ ~  fs3 ~ cs4 ~ ~ ~")
    .sound("sawtooth")
    .lpf(290)
    .attack(0.007).decay(0.11).sustain(0.45).release(0.08)
    .gain(0.62)
    .slow(3),

  note("<[b4,ds5,fs5,as5] [gs4,b4,ds5,fs5] [cs4,e4,gs4,b4] [fs4,as4,cs5,e5]>")
    .sound("sawtooth")
    .attack(0.038)
    .release(0.36)
    .lpf(2550)
    .room(0.25)
    .gain(0.33)
    .pan(0.43)
    .slow(2),

  note("<[b3,ds4,fs4] [gs4,b4,ds5] [cs4,e4,gs4] [fs4,as4,cs5]>")
    .sound("sine")
    .attack(0.13)
    .release(0.68)
    .lpf(1350)
    .room(0.39)
    .gain(0.17)
    .slow(4),

  note("ds5 ~ fs5 ~ gs5 fs5 ~ ds5  ~ cs5 ~ ~ b4 ~ ~ ds5")
    .sound("sine")
    .attack(0.019)
    .release(0.29)
    .delay(0.38)
    .delaytime(0.333)
    .delayfeedback(0.18)
    .room(0.37)
    .gain(0.53)
    .pan(0.5)
    .slow(2)

)`
  }
];
