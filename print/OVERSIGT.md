# Oversigt — FP9 Øvelsesark

Status pr. 2026-04-29 (en uge til prøven). Hvert emne har sin egen mappe, og inden for mappen kan der være flere ark i tre kategorier.

## 3 kategorier af ark

| Kategori | Filnavn-præfiks | Indhold | Facit | Default-model |
|---|---|---|---|---|
| **Tutorial** | `tutorial-NN.html` | Kun metode/how-to. Flere worked examples. | Nej | — |
| **Arbejdsark** | `arbejdsark-NN.html` | Metode + opgaver + facit. Standard-model. | Ja | `ark/addition/arbejdsark-01.html` |
| **Cheatsheet** | `cheatsheet-NN.html` | Tabeller, konverteringsskemaer, formler. Én side. | Nej | — |

Underformer af arbejdsark (fx "kun prøveklar", "kun varm op + på papir") defineres ikke på forhånd — vi tilpasser indholdet pr. forespørgsel.

## Mappestruktur

```
ark/
├── addition/
│   └── arbejdsark-01.html   ← kanonisk eksempel (5 sektioner)
├── subtraktion/             ← kommer
├── multiplikation/          ← kommer
├── division/                ← kommer
├── decimaltal/              ← kommer
├── procent/                 ← kommer
├── ligninger/               ← kommer
├── enhedsomregning/         ← kommer
├── vinkler/                 ← kommer
└── ... osv.
```

Inden for hver mappe kan der ligge så mange ark man har lyst til — fx `arbejdsark-01`, `arbejdsark-02`, `tutorial-01`, `cheatsheet-01`. Mapper oprettes når der er behov.

## Status

### Tal og algebra
| Emne | Eksisterende ark | Mangler |
|---|---|---|
| Addition | ✅ [arbejdsark-01](ark/addition/arbejdsark-01.html) · ✅ [tutorial-01](ark/addition/tutorial-01.html) | — |
| Subtraktion | — | ⬜ |
| Multiplikation | — | ⬜ |
| Division | — | ⬜ |
| Decimaltal | — | ⬜ |
| Procent og brøk | — | ⬜ |
| Ligninger | — | ⬜ |
| Regneudtryk / indsæt tal | — | ⬜ |
| Overslagsregning | — | ⬜ |
| Hverdagsregning | — | ⬜ |

### Geometri og måling
| Emne | Eksisterende ark | Mangler |
|---|---|---|
| Enhedsomregning | — | ⬜ |
| Vinkler | — | ⬜ |
| Koordinatsystem | — | ⬜ |
| Rumfang og areal | — | ⬜ |
| Ligedannethed | — | ⬜ |

### Statistik og sandsynlighed
| Emne | Eksisterende ark | Mangler |
|---|---|---|
| Diagramaflæsning | — | ⬜ |
| Tabeller og gennemsnit | — | ⬜ |
| Sandsynlighed | — | ⬜ |

## Sådan bruges projektet

1. **Bestil et ark:** Sig fx "byg et arbejdsark om subtraktion" eller "lav et cheatsheet om enhedsomregning". Claude bygger ét ark ad gangen.
2. **Iteration:** Åbn HTML-filen i browseren. Fortæl Claude hvad der skal rettes. Læringen havner i [DESIGN.md](DESIGN.md) og/eller [PRINCIPPER.md](PRINCIPPER.md).
3. **Print:** Browser → Cmd+P → "Gem som PDF" eller print direkte. Sidste side er altid facit (på arbejdsark).

## Filer

```
CLAUDE.md          → orienteringskort (læses af Claude i hver session)
DESIGN.md          → visuelt sprog + genbrugelige SVG-mønstre
PRINCIPPER.md      → pædagogiske læringer
OVERSIGT.md        → denne fil
KONCEPT.md         → original projektbeskrivelse (historisk, ikke aktiv)
shared/ark.css     → minimal print + math-helpers (resten via Tailwind CDN)
ark/<emne>/<type>-NN.html   → arkene
```
