# Review-rubric for FP9 Øvelsesark

Bruges til at vurdere om et ark fremmer læring og om PRØVEKLAR-sektionen matcher rigtige FP9-opgaver.

**Sådan invokeres:** `/review-ark <sti>` eller bare "review ark X" til Claude.

## Output-format

```
## Review: <ark-sti>

### Del A — Læringsfremmende (hele arket)

A1. Metode er kort og visuel:    🟢/🟡/🔴
    [konkret observation]
A2. Ingen fagord uden forklaring: 🟢/🟡/🔴
    [konkret observation]
…

### Del B — FP9-match (PRØVEKLAR)

B1. Ordlyd matcher FP9:           🟢/🟡/🔴
    [observation, evt. citat fra FP9-PDF]
…

### Anbefalede ændringer

1. [konkret ændring] — fordi [hvorfor]
2. …
```

Reviewet er **rapport-only**. Brugeren beslutter hvilke ændringer der skal laves.

---

## Del A — Læringsfremmende (hele arket)

| # | Kriterium | 🔴 = |
|---|---|---|
| **A1** | Metode er kort og visuel — max 2 korte sætninger ud over selve eksemplet | Tekstmur eller flere worked examples uden grund |
| **A2** | Ingen fagord uden forklaring — "ten i mente", "sum", "ækvivalent", "frekvens" osv. | Fagord står uforklarede i metoden |
| **A3** | Stigende sværhedsgrad — varm op < på papir < prøveklar | Sværhedsgraden er flad eller tilfældig |
| **A4** | Plads til at vise udregningen — udregningsfelt på min. ~110pt | Kun små svarlinjer uden plads til kolonneopstilling |
| **A5** | FP9-imperativer er brugt — "Udregn", "Løs ligningerne", "Sæt et X", "Hvor stor en procentdel..." | Fri/personlig ordlyd ("regn det her ud") |
| **A6** | Mindst én implicit opgave med distraktor | Alle opgaver har værdierne eksplicit i opgaveteksten |
| **A7** | Visualiseringer hjælper, ikke pynter — hver SVG bidrager med information eller forståelse | En illustration kan slettes uden at opgaven mister noget |

## Del B — FP9-match (kun PRØVEKLAR-sektion)

*N/A for tutorial- og cheatsheet-ark.*

| # | Kriterium | 🔴 = |
|---|---|---|
| **B1** | Ordlyd matcher FP9 — sammenlign med PDF'er i `Elevprøver_FP9guidelines/`. Citér FP9-vendinger der bør bruges. | Lyder som lærebogsopgave, ikke FP9 |
| **B2** | Svarformat matcher FP9 — stiplet rektangulær svarboks + enhed bag | Svarlinje (`____`) eller manglende enhed |
| **B3** | Realistisk indpakning — hverdagskontekst, konkret personnavn | Abstrakte tal uden situation |
| **B4** | Sværhedsgrad matcher FP9 — tal-størrelser og antal trin ligner FP9 | Trivielt eller umuligt for målgruppen |
| **B5** | Mindst én illustration har distraktor-værdier | Alle illustrationer har kun relevante værdier |
| **B6** | Værdier i illustrationer klart aflæselige — kontrast, størrelse, placering | Man skal kæmpe for at læse værdier |

## Del C — Tutorial-specifikke kriterier

*Kun for tutorial-ark. For arbejdsark- og cheatsheet-reviews er Del C n/a. Når Del C bruges, er Del B og kriterierne A4 (plads til udregning) og A6 (distraktor i opgave) også n/a.*

| # | Kriterium | 🔴 = |
|---|---|---|
| **C1** | Klarhed for en helt fersk elev — kan en 9.-klasses elev der aldrig har set metoden læse arket og forstå? | Forudsætter forhåndsviden eller fagord uden forklaring |
| **C3** | Visualiseringer forklarer *hvorfor*, ikke kun *hvad* — eleven får en mental model, ikke bare et procedure-trick | Trin præsenteres som "magi" uden konceptuel forankring |
| **C4** | Selvforklarende uden lærer — eleven kan læse og forstå alene | Kræver lærerstøtte for at give mening |
| **C7** | Outro / næste skridt — peger mod relevant arbejdsark eller næste handling | Slutter abrupt, intet næste skridt |
| **C9** | Konsistens med arbejdsark-kanon — bruger samme metode-eksempel som det relevante arbejdsark | Eleven ser nye eksempler i arbejdsarket og bliver forvirret |

---

## Reviewers ground truth

Reviewer'en skal altid sammenligne med de tre faktiske FP9-eksempler:
- `Elevprøver_FP9guidelines/Evaluering i folkeskolen ismail.pdf`
- `Elevprøver_FP9guidelines/Evaluering i folkeskolen kerem.pdf`
- `Elevprøver_FP9guidelines/Evaluering i folkeskolen sandra.pdf`

— især for at hente konkrete ordlyds-eksempler til Del B.
