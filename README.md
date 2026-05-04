# ebtesti — Eduarda Baumaņa testi

Personīgs eksperimentu lauks, lai apgūtu [Strudel](https://strudel.cc) — pārlūkā darbojošos live coding vidi mūzikas veidošanai ar kodu. Šeit notiek eksperimenti: pamatu apguve, žanru izpēte un oriģinālu skaņdarbu komponēšana.

---

## Licence

Šis projekts ir licencēts ar **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### AGPL-3.0 prasības šim projektam:

1. **Avota koda pieejamība**: Ja jūs modificējat šo kodu un padarāt to pieejamu citiem (piemēram, publicējot tīmeklī), jums jānodrošina pilns avota kods zem AGPL-3.0 licences.

2. **Tīkla servisa klauzula**: Ja jūs darbināt modificētu versiju kā tīmekļa servisu (piemēram, hostojot Strudel lietotni ar saviem skaņdarbjiem), lietotājiem jābūt pieejamai avota kodam.

3. **Autortiesības**: Oriģinālais saturs (skaņdarbi, mācību materiāli) ir autortiesīgs Eduarda Baumaņa, 2024.

### Strudel atkarība:

Šis projekts izmanto [Strudel](https://strudel.cc), kas ir licencēts zem AGPL-3.0. Tādēļ viss saturs, kas ir atkarīgs no Strudel izpildes vides, ir pakļauts AGPL-3.0 prasībām.

---

## Kas šeit ir

### [Skola/](Skola/) — Strudel kurss

Pašrocīgi izveidots 10 nodarbību kurss, kas tapa apgūstot Strudel no nulles. Katra nodarbība ir `.strudel` fails ar teorijas piezīmēm, koda piemēriem un uzdevumiem.

| Nodarbība | Tēma |
|-----------|------|
| 01 | Ritma pamati — BPM, takti, bungu notācija |
| 02 | Mini-notācija — patternu sintakse |
| 03 | Noti un augstums |
| 04 | Skalas un melodija |
| 05 | Akordi un harmonija |
| 06 | Sintezatori un skaņas dizains |
| 07 | Efekti — reverbs, delays, filtri |
| 08 | Sarežģīts ritms — Eiklīda patterniņi, poliritmija |
| 09 | Struktūra un aranžējums |
| 10 | Pilns skaņdarbs — viss kopā |

Atver jebkuru nodarbību [Strudel REPL](https://strudel.cc) un nospied `Ctrl+Enter`, lai atskaņotu.

---

### [TehnoSkola/](TehnoSkola/) — Tehno žanru studijas

10 padziļinātas ieniršanas tehno apakšžanros — katrs kā koda piemērs ar vēsturisko kontekstu un skaņas dizaina piezīmēm.

Detroita · Berlīnes minimālisms · Skābe · Dabs · Industriālais · Cietais · Hipnotiskais/Tumšais · Melodiskais · Transs · Gābers

---

### [lofi/](lofi/) — Oriģināls lo-fi albums

25 oriģināli skaņdarbi, komponēti Strudel — lo-fi džezs, hip-hop, bossa nova un sintveivs. Katrs ir pilnībā slāņots `.strudel` fails ar bungām, basu, akordiem un melodiju.

Daži skaņdarbi:
- `song-01-3am-rain` — C minors, putekļains un silts
- `song-04-midnight-walk` — nakts groove
- `song-11-rainy-window` — lēns un iekšēji vērsts
- `song-25-autumn-leaves` — džeza ietekmēts noslēgums

---

### [lofi-rater/](lofi-rater/) — Dziesmu vērtēšanas lietotne

Vienkārša tīmekļa lietotne lo-fi skaņdarbu klausīšanai un vērtēšanai (KARSTS / AUKSTS). Izveidota ar tīru HTML, CSS un JavaScript — bez framework'iem.

**Izmēģini:** [eduardsbaumanis.github.io/ebtesti/lofi-rater](https://eduardsbaumanis.github.io/ebtesti/lofi-rater/)

---

## Kā lietot `.strudel` failus

1. Atver [strudel.cc](https://strudel.cc)
2. Iekopē jebkura `.strudel` faila saturu redaktorā
3. Nospied `Ctrl+Enter`, lai sāktu, `Ctrl+.`, lai apstātos
4. Maini vērtības tiešraidē — viss atjaunojas reāllaikā

---

## Tehnoloģijas

- [Strudel](https://strudel.cc) — mūzikas live coding (TidalCycles pārlūkam)
- Web Audio API — pārlūkā iebūvēta audio apstrāde
- Tīrs HTML/CSS/JS — lofi-rater saskarne
- GitHub Pages — hostings
