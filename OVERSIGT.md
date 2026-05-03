# Oversigt — FP9 Matematik (web-projekt)

> Status pr. 2026-05-03 søndag eftermiddag, efter pivot til 3-lag-modellen.
> *(Print-projektets gamle oversigt er flyttet til [print/OVERSIGT.md](print/OVERSIGT.md).)*

## 3-lag-modellen pr. disciplin

Hver disciplin har op til tre lag. Definition og krav i
[TRAENINGSMODUL-RUBRIK.md](TRAENINGSMODUL-RUBRIK.md).

| Symbol | Betydning |
|---|---|
| ✅ | Bygget i ny stil og klar til elev |
| 🟡 | Bygget i gammel stil (overlever som terpe-baseline indtil pivot) |
| ⬜ | Ikke startet |
| 🚫 | Ikke planlagt for prøven |

### Tal og algebra

| Disciplin | Lag 1 · Lektion | Lag 2 · Terpe | Lag 3 · FP9-replika |
|---|---|---|---|
| Addition | 🟡 prototype (skal færdiggøres) | 🟡 12 quiz-opgaver | ⬜ |
| Subtraktion | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Multiplikation | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Division | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Decimaltal | ⬜ | ⬜ | ⬜ |
| Procent og brøk | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Ligninger | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Regneudtryk | ⬜ | ⬜ | ⬜ |
| Overslagsregning | ⬜ | ⬜ | ⬜ |
| Hverdagsregning | ⬜ | 🟡 12 quiz-opgaver | ⬜ |

### Geometri og måling

| Disciplin | Lag 1 · Lektion | Lag 2 · Terpe | Lag 3 · FP9-replika |
|---|---|---|---|
| Enhedsomregning | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Vinkler | ⬜ | ⬜ | ⬜ |
| Koordinatsystem | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Rumfang og areal | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Ligedannethed | ⬜ | ⬜ | ⬜ |

### Statistik og sandsynlighed

| Disciplin | Lag 1 · Lektion | Lag 2 · Terpe | Lag 3 · FP9-replika |
|---|---|---|---|
| Diagrammer | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Tabeller og gennemsnit | ⬜ | 🟡 12 quiz-opgaver | ⬜ |
| Sandsynlighed | ⬜ | 🟡 12 quiz-opgaver | ⬜ |

---

## Hvad eleverne ser lige nu

- **Live på <https://jbmnapps.github.io/mat/>** efter login
- 13 disciplinerne med "Træning"-knap aktiv (giver 12 quiz-opgaver)
- 1 disciplin (addition) med "Lektion"-knap aktiv (interaktiv prototype)
- "Prøveklar"-knap er greyed-out på alle disciplinerne
- 5 disciplinerne (decimaltal, regneudtryk, overslagsregning, vinkler, ligedannethed) har ingen indhold endnu — vises som greyed-out på dashboard

---

## Prioritering ved pivoten

### Først (i dag/i nat)
- Færdiggør lag 1 for **én** disciplin som proof-of-concept for skalerbar model
- Kandidater: addition (færdiggør prototype) eller procent (vægter tungest på FP9)

### Næste (efter prøven, hvis tid)
- Replikér lag 1 til de andre tunge FP9-discipliner (procent, regnearter, ligninger)
- Lag 2: opdel eksisterende quiz-opgaver i varianter pr. disciplin
- Lag 3: FP9-replika baseret på `Elevprøver_FP9guidelines/`

---

## Hvor ting ligger

```
app/                              ← Next.js routes
  [disciplin]/                    ← Per-disciplin
    lektion/page.tsx              ← Lag 1 ind-gang
    traening/page.tsx             ← Lag 2 ind-gang (i dag: quiz)
    proeveklar/page.tsx           ← Lag 3 ind-gang (greyed pt.)
components/
  lektion/                        ← Lag 1-moduler
    addition-interactive.tsx      ← Eneste der findes pt. — mønster
  quiz.tsx                        ← Lag 2-engine (kan genbruges)
lib/
  disciplines.ts                  ← Master-liste
  opgaver/<disciplin>.ts          ← Lag 2-opgavebanker (gamle quiz-format)
  content-registry.ts             ← Hvad er bygget pr. lag (pt. unøjagtigt)
print/                            ← Det oprindelige print-projekt (reference)
archive/                          ← Pre-pivot-docs (historik)
```

---

## Status pr. dato

- *2026-05-03 v1:* Pivot til 3-lag-model. OVERSIGT.md skrevet om fra bunden. Alt eksisterende træning markeret 🟡 indtil det erstattes af lag 2-versioner.
