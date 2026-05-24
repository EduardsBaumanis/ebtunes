# ebtesti — Eduarda Baumaņa testi

Personīgs eksperimentu lauks, lai apgūtu [Strudel](https://strudel.cc) —
pārlūkā darbojošos live-coding vidi mūzikas veidošanai ar kodu. Šajā
repozitorijā ir vairāk nekā **300 oriģināli `.strudel` skaņdarbi**, divi
mācību kursi, vairāki atskaņotāji ar vērtēšanu un līderlisti, kā arī
rīki, kas to visu sasaista.

**Galvenā lietotne** — atskaņotājs ar visiem skaņdarbiem, iebūvētu
Strudel IDE, vērtēšanu un līderlisti:

➜ **[eduardsbaumanis.github.io/ebtesti/player/](https://eduardsbaumanis.github.io/ebtesti/player/)**

> Vecākā saite [`/lofi-rater/`](https://eduardsbaumanis.github.io/ebtesti/lofi-rater/)
> automātiski pārceļ uz jauno atskaņotāju.

---

## Saturs

- [Skaņdarbu kolekcijas](#skaņdarbu-kolekcijas)
- [Lietotnes](#lietotnes)
- [Rīki](#rīki)
- [Mācību kursi](#mācību-kursi)
- [Dokumentācija](#dokumentācija)
- [Kā lietot `.strudel` failus](#kā-lietot-strudel-failus)
- [Tehnoloģijas](#tehnoloģijas)
- [Licence](#licence)

---

## Skaņdarbu kolekcijas

| Mape | Tēma | Skaits |
|---|---|---:|
| [`lofi/`](lofi/) | Lo-fi džezs, hip-hop, bossa nova, sintveivs | 30 |
| [`rim/`](rim/) | Western / "no man's land" — putekļains, terakotas tonālis | 15 |
| [`acid/`](acid/) | Skābais tehno — TB-303, transs, industriālais | 5 |
| [`prog/`](prog/) | Dziesmas programmētājiem — IDE, terminālis, debuga sesijas | 15 |
| [`TehnoSkola/`](TehnoSkola/) | Tehno apakšžanru studijas (kods + vēsturiskais konteksts) | 10 |
| [`jazz-piano/`](jazz-piano/) | Lēnas, džezīgas klavieru kompozīcijas — katra ar atšķirīgu teoriju | 20 |
| [`study/`](study/) | Mācību mūzika — minimālisms, polirimas, modāli, granulārs sintēzs | 30 |
| [`yt/`](yt/) | Skaņas efekti YouTube esejām, DIY un izglītības video | 20 |
| [`game/`](game/) | Videospēļu skaņas efekti (jump, coin, victory, game over u.c.) | 20 |
| [`pack-demos/`](pack-demos/) | Pa diviem demo katrai no 50 GitHub semplu pakām | 100 |
| [`amapiano/`](amapiano/) | Dienvidāfrikas amapiano — koka bungas, jaza klavieres, soweto kori, vizualizācijas | 20 |
| [`footwork/`](footwork/) | Čikāgas footwork / juke — 160 BPM, triplet hai-hat, 808 stabu melodijas | 20 |

Daži favorīti:

- `lofi/song-01-3am-rain` — C minors, putekļains un silts
- `jazz-piano/jazz-09-tritone-romance` — tritona aizstāšanas pētījums G minorā
- `study/study-17-mridangam-misra` — Hindustāni Misra Chapu (7-sitienu cikls) Raag Yaman
- `amapiano/07-polyperc-study` — pieci ritmi 3 / 4 / 5 / 7 / 11 ar `_punchcard` fāzes redzējumu
- `footwork/12-polymetric-feet` — kicks 4, 808 5, hat 7, clap 3 — viss vienlaikus, ar etiķetēm
- `TehnoSkola/techno-08-melodic-techno` — melodiskais tehno ar Detroitas saknēm
- `prog/song-06-terminal-green` — CRT fosfora zaļš, kompilēšanās laikā

---

## Lietotnes

| Mape | Apraksts | URL |
|---|---|---|
| [`player/`](player/) | **Galvenā lietotne.** Iebūvēts Strudel IDE ar redzamu kodu, kreisajā sānjoslā ir saliekams kataloga koks ar visiem albumiem, atbalsts ar **`+ / −`** vērtēšanu un dzīvo līderlisti. Strādā mobilajās ierīcēs (sānjosla pārvēršas par atvelkamu paneli). | [`/player/`](https://eduardsbaumanis.github.io/ebtesti/player/) |
| [`lofi-player/`](lofi-player/) | Vecākais atskaņotājs — cilnes pēc albumiem, automātiska nākamā skaņdarba pāreja ar laika gredzenu, BOARD cilne ar Realtime atjauninājumiem. | [`/lofi-player/`](https://eduardsbaumanis.github.io/ebtesti/lofi-player/) |
| [`lofi-rater/`](lofi-rater/) | _Pārceļ uz `/player/`._ Saglabāts kā saderības saite vecākām grāmatzīmēm. | — |

Visas trīs lietotnes dalās ar vienu **Supabase backendu** (skat.
[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)), tāpēc balsis un līderliste
tiek apvienotas neatkarīgi no tā, kuru saskarni izmanto.

---

## Rīki

| Mape | Apraksts |
|---|---|
| [`agent/`](agent/) | Python CLI, kas ar Claude API ģenerē jaunus `.strudel` failus no dabīgas valodas brīfa. Iekļauj validēšanas-atkārtošanas cilpu — kods tiek izpildīts headless Chromium pārlūkā, un, ja Strudel to noraida, kļūda tiek nodota atpakaļ Claude jaunam mēģinājumam. |
| [`sampler/`](sampler/) | Python skripts, kas sagriež `.mp3` / `.wav` failus un sakārto sempļus **bass / kick / melody / other** apakšmapēs, izmantojot LAION CLAP audio klasificētāju (ar atgriezenisko opciju, kas izmanto tikai librosa skaitliskās pazīmes). |
| [`strudel-to-mp3/`](strudel-to-mp3/) | Pārvērš `.strudel` failus 5 minūšu MP3 ierakstos. Izmanto Playwright + headless Chromium, lai izpildītu Strudel un ierakstītu audio caur Web Audio MediaRecorder; ffmpeg pārkodē uz MP3. |

---

## Mācību kursi

### [`Skola/`](Skola/) — Strudel kurss (10 nodarbības + 6 šparga lapas)

| Nodarbība | Tēma |
|---|---|
| 01 | Ritma pamati — BPM, takti, bungu notācija |
| 02 | Mini-notācija — patternu sintakse |
| 03 | Notis un augstums |
| 04 | Skalas un melodija |
| 05 | Akordi un harmonija |
| 06 | Sintezatori un skaņas dizains |
| 07 | Efekti — reverbs, delay, filtri |
| 08 | Sarežģīts ritms — Eiklīda patternu, poliritmija |
| 09 | Struktūra un aranžējums |
| 10 | Pilns skaņdarbs — viss kopā |

Sešas `cheat-*.strudel` šparga lapas detalizēti dokumentē retāk
izmantotās Strudel funkcijas (`mask`, `struct`, `chunk`, `iter`,
`ribbon`, `squeeze`, `ply`, `jux`, `arp` u.c.).

### [`TehnoSkola/`](TehnoSkola/) — Tehno apakšžanri (10 nodarbības)

Detroita · Berlīnes minimālisms · Skābe · Dabs · Industriālais · Cietais
· Hipnotiskais / Tumšais · Melodiskais · Transs · Gābers

---

## Dokumentācija

| Fails | Apraksts |
|---|---|
| [`STRUDEL_SAMPLE_REPOS.md`](STRUDEL_SAMPLE_REPOS.md) | Pārbaudīts saraksts ar **50 GitHub semplu paku repozitorijiem**, kas darbojas ar Strudel — Dirt-Samples, dough-samples, Bubo Dough-* paciņas, VCSL, geikha/tidal-drum-machines, patchbanks lo-fi/techno datu kopas u.c. Ar īsām instrukcijām katras paciņas ielādēšanai. |
| [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) | Soli pa solim, kā iestatīt Supabase projektu ar `song_votes` tabulu, `leaderboard` skatu un Realtime publikāciju. Atskaņotāji izmanto vienu un to pašu backendu, un balsis tiek apvienotas starp visām trim lietotnēm. |
| [`supabase-setup.sql`](supabase-setup.sql) | Idempotents SQL skripts, kas atbilst SUPABASE_SETUP.md — palaiž to Supabase SQL Editor. |

---

## Kā lietot `.strudel` failus

**Pārlūkā ar atskaņotāju:**

1. Atver [eduardsbaumanis.github.io/ebtesti/player/](https://eduardsbaumanis.github.io/ebtesti/player/)
2. Kreisajā sānjoslā noklikšķini uz albuma, lai izvērstu
3. Noklikšķini uz skaņdarba — kods ielādējas IDE
4. `Ctrl+Enter` — atskaņot · `Ctrl+.` — apstāties · `+` / `−` — balsot

**Tieši Strudel REPL:**

1. Atver [strudel.cc](https://strudel.cc)
2. Iekopē jebkura `.strudel` faila saturu redaktorā
3. `Ctrl+Enter` — sākt · `Ctrl+.` — apstāties

**Lokāli ar pašu hostingu:**

```bash
# No repo saknes — jebkurš HTTP serveris derēs
npx serve .
# vai:
python3 -m http.server 8000
```

Pēc tam atver `http://localhost:3000/player/` (vai `:8000` Python servera
gadījumā).

---

## Tehnoloģijas

- **[Strudel](https://strudel.cc)** — mūzikas live-coding valoda (TidalCycles ar pārlūku, JavaScript)
- **Web Audio API** — pārlūkā iebūvēta audio apstrāde un sintēze
- **[Supabase](https://supabase.com)** — balsošana + līderliste (Postgres + Realtime websockets)
- **[Anthropic Claude API](https://platform.claude.com)** — `agent/` skaņdarbu ģenerators
- **[Playwright](https://playwright.dev)** + headless Chromium — `strudel-to-mp3/` audio ierakstīšana un `agent/` validēšana
- **[librosa](https://librosa.org)** + **[LAION CLAP](https://github.com/LAION-AI/CLAP)** — `sampler/` audio analīze un klasificēšana
- **Tīrs HTML / CSS / JavaScript** — visas trīs lietotnes (`player/`, `lofi-player/`, vecā `lofi-rater/`), bez framework atkarībām
- **GitHub Pages** — statiskais hostings

---

## Licence

Šis projekts ir licencēts ar **GNU Affero General Public License v3.0
(AGPL-3.0)**.

### AGPL-3.0 prasības šim projektam

1. **Avota koda pieejamība.** Ja modificē šo kodu un padara to pieejamu
   citiem (piemēram, publicējot tīmeklī), jānodrošina pilns avota kods
   zem AGPL-3.0 licences.

2. **Tīkla servisa klauzula.** Ja darbina modificētu versiju kā tīmekļa
   servisu (piemēram, hosto Strudel lietotni ar saviem skaņdarbiem),
   lietotājiem jābūt pieejamai avota kodam.

3. **Autortiesības.** Oriģinālais saturs (skaņdarbi, mācību materiāli)
   ir autortiesīgs Eduarda Baumaņa, 2024.

### Strudel atkarība

Šis projekts izmanto [Strudel](https://strudel.cc), kas ir licencēts zem
AGPL-3.0. Tādēļ viss saturs, kas ir atkarīgs no Strudel izpildes vides,
ir pakļauts AGPL-3.0 prasībām.
