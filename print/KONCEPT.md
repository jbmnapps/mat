# FP9 Matematik Opgave-Generator

## Projektbeskrivelse

Et system der genererer **printbare matematiark** til øvebrug for folkeskoleelever, der forbereder sig til FP9 Matematik uden hjælpemidler. Arkene skal ligne de rigtige prøver i stil og sværhedsgrad, så eleverne træner under realistiske forhold.

---

## Discipliner (fra FP9-pensum)

Systemet dækker de tre hovedområder med følgende underemner:

### 1. Tal og algebra
| Underemne | Opgavetyper | Visualisering |
|---|---|---|
| **Hverdagsregning** | Priser, rabatter, valutaomregning, mængdeberegning | Tegninger af varer med priser |
| **Procent og brøk** | Omregning mellem procent, brøk og decimal | — |
| **De fire regnearter** | Addition, subtraktion, multiplikation, division (hel- og decimaltal) | — |
| **Regneudtryk** | Indsæt tal så udtryk bliver sande, ækvivalente udtryk | — |
| **Ligninger** | Førstegradusligninger med x på én eller begge sider | — |
| **Overslagsregning** | Multiple-choice: vælg det rigtige størrelsesorden-svar | — |
| **Algebraiske udtryk** | Indsæt værdier, find ækvivalente udtryk | — |
| **Brøksammenligning** | Hvilken brøk er størst / mindst, negative resultater | — |

### 2. Geometri og måling
| Underemne | Opgavetyper | Visualisering |
|---|---|---|
| **Enhedsomregning** | m→km, cm→mm, dL→mL, døgn→timer osv. | — |
| **Vinkler** | Beregn ukendte vinkler ud fra skitser med forlængede sider | Geometriske skitser med vinkelmål |
| **Koordinatsystem** | Aflæs koordinater, find ligning for linje gennem punkt | Koordinatsystem med punkter |
| **Rumfang og areal** | V = G · h, areal af grundflade, sidelængder | Isometriske kasse-tegninger |
| **Ligedannethed** | Forholdstal mellem sider, areal-faktor, ligedannede rektangler | Skitser af figurer med mål |

### 3. Statistik og sandsynlighed
| Underemne | Opgavetyper | Visualisering |
|---|---|---|
| **Diagramaflæsning** | Aflæs søjle-/linjediagrammer, beregn procentpoint og procentvis stigning | Søjlediagrammer med data |
| **Tabeller og gennemsnit** | Aflæs frekvenstabeller, beregn gennemsnit | Tabeller |
| **Sandsynlighed** | Møntkast, terningkast, kombinatorik med brøk/procent | Illustrationer af situationer |

---

## Arkitektur

```
fp9-matematik-generator/
│
├── src/
│   ├── generators/           # En generator pr. underemne
│   │   ├── tal-og-algebra/
│   │   │   ├── hverdagsregning.ts
│   │   │   ├── procent-broek.ts
│   │   │   ├── regnearter.ts
│   │   │   ├── ligninger.ts
│   │   │   ├── overslagsregning.ts
│   │   │   └── ...
│   │   ├── geometri-og-maaling/
│   │   │   ├── enhedsomregning.ts
│   │   │   ├── vinkler.ts
│   │   │   ├── koordinatsystem.ts
│   │   │   ├── rumfang-areal.ts
│   │   │   └── ligedannethed.ts
│   │   └── statistik-og-sandsynlighed/
│   │       ├── diagramaflaesning.ts
│   │       ├── tabeller-gennemsnit.ts
│   │       └── sandsynlighed.ts
│   │
│   ├── visuals/              # SVG-generatorer til figurer
│   │   ├── coordinate-grid.ts
│   │   ├── angle-sketch.ts
│   │   ├── bar-chart.ts
│   │   ├── box-isometric.ts
│   │   ├── price-tags.ts
│   │   └── similar-figures.ts
│   │
│   ├── layout/               # Print-layout og styling
│   │   ├── worksheet.ts      # Samler opgaver til et ark
│   │   ├── answer-key.ts     # Genererer facit
│   │   └── print.css         # Print-specifik styling
│   │
│   ├── types.ts              # Fælles typer
│   └── index.ts              # Entry point / CLI
│
├── output/                   # Genererede PDF'er
├── templates/                # HTML-templates til arkene
└── package.json
```

---

## Opgave-model (TypeScript)

```typescript
interface Opgave {
  id: string;
  disciplin: 'tal-og-algebra' | 'geometri-og-maaling' | 'statistik-og-sandsynlighed';
  underemne: string;
  titel: string;
  beskrivelse: string;           // Opgavetekst
  delopgaver: Delopgave[];
  visual?: VisualConfig;         // Evt. tilhørende figur
}

interface Delopgave {
  nummer: string;                // "1.1", "1.2" osv.
  tekst: string;
  svartype: 'tal' | 'broek' | 'multiple-choice' | 'tekst';
  svar: string | number;        // Korrekt svar (til facit)
  enhed?: string;               // "kr.", "cm", "%", "grader" osv.
  valgmuligheder?: string[];    // Til multiple-choice
  acceptInterval?: [number, number]; // Til "ca."-svar
}

interface VisualConfig {
  type: 'coordinate-grid' | 'angle-sketch' | 'bar-chart' | 'box-3d' | 'price-display' | 'similar-figures' | 'table';
  data: Record<string, any>;    // Specifik data til visualiseringen
}

interface Ark {
  titel: string;
  disciplin: string;
  underemne?: string;
  opgaver: Opgave[];
  facit: Facit[];
  dato: string;
}
```

---

## Design-retningslinjer (Print)

### Layout
- **Format:** A4, stående
- **Marginer:** 2 cm top/bund, 2,5 cm sider
- **Header:** Disciplin-navn + underemne, elevnavn-felt, dato-felt
- **Footer:** Sidetal, "FP9 Øvelsesark"
- **Opgavenummerering:** Samme system som FP9 (1.1, 1.2, 1.3 osv.)

### Typografi
- **Overskrifter:** Serifløs, fed, 14pt
- **Brødtekst:** Serif eller serifløs, 11pt, god linjeafstand (1.4)
- **Matematik:** Klare tal, brøkstreger med god tykkelse
- **Svarfelter:** Stiplede linjer med enhed bag (______ kr.)

### Visualiseringer
- **Sort/hvid-venlige** — skal fungere på en printer uden farve
- **Tydelige akser og labels** på diagrammer
- **Geometriske figurer** med rene streger, vinkelbuer og mål
- **Pris-illustrationer** i simpel stil med tydelige tal
- Alle figurer skal have tilstrækkelig størrelse til at aflæses (min. 6 cm bred)

### Svarformat
- Tomme svarfelter med stiplede linjer: `____________ kr.`
- Brøk-felter med tæller/nævner-bokse
- Multiple-choice med afkrydsningsbokse (□)
- Plads til udregninger ved siden af eller under opgaven

---

## Workflow

```
1. Lærer vælger:
   ├── Disciplin (eller blanding)
   ├── Underemne(r)
   ├── Antal opgaver
   └── Sværhedsgrad (let / mellem / svær)

2. System genererer:
   ├── Tilfældige tal inden for passende intervaller
   ├── Tilhørende visualiseringer
   ├── Facit-ark

3. Output:
   ├── Opgaveark (PDF, print-klar)
   └── Facitark (PDF, separat side)
```

---

## Implementeringsplan

### Fase 1 — Fundament
- [ ] Opsæt projekt (Node/TS + HTML→PDF pipeline)
- [ ] Byg print-layout med CSS (A4, svarfelter, header/footer)
- [ ] Implementér 2-3 simple generatorer (regnearter, enhedsomregning, ligninger)
- [ ] Facit-generering

### Fase 2 — Visualiseringer
- [ ] SVG-generator: koordinatsystem med punkter
- [ ] SVG-generator: vinkelfigurer
- [ ] SVG-generator: søjlediagrammer
- [ ] SVG-generator: kasser/figurer med mål

### Fase 3 — Fuld dækning
- [ ] Alle underemner implementeret
- [ ] Multiple-choice opgaver
- [ ] Brøk-visning (tæller/nævner)
- [ ] Hverdagsregning med pris-illustrationer

### Fase 4 — Interface
- [ ] Simpelt web-UI til at vælge disciplin/antal/sværhed
- [ ] Download som PDF
- [ ] Print direkte fra browser

---

## Eksempel: Genereret opgave

```
┌─────────────────────────────────────────────────────┐
│  FP9 Øvelsesark — Tal og algebra                    │
│  Navn: ________________    Dato: ________________   │
│─────────────────────────────────────────────────────│
│                                                     │
│  Opgave 1                                           │
│                                                     │
│  Asta køber nødder, der koster 24,00 kr. pr. 100 g. │
│                                                     │
│  ┌──────────────────┐                               │
│  │   NØDDER         │                               │
│  │  24,00 kr.       │                               │
│  │  pr. 100 g       │                               │
│  └──────────────────┘                               │
│                                                     │
│  1.1  Hvor meget skal Asta betale                   │
│       for 350 g nødder?          __________ kr.     │
│                                                     │
│  1.2  Hvor mange gram nødder kan                    │
│       Asta købe for 60,00 kr.?   __________ g      │
│                                                     │
│─────────────────────────────────────────────────────│
│  Opgave 2                                           │
│                                                     │
│  Løs ligningerne:                                   │
│                                                     │
│  2.1   15 + 3x = 36       x = __________           │
│                                                     │
│  2.2   4x – 7 = 2x + 11   x = __________           │
│                                                     │
│                                           Side 1/2  │
└─────────────────────────────────────────────────────┘
```

---

## Tekniske noter

- **PDF-generering:** Puppeteer (headless Chrome) til HTML→PDF, giver bedst print-kvalitet
- **Tilfældighed:** Seeded RNG så man kan genskabe et specifikt ark
- **Tal-intervaller:** Hvert underemne har definerede intervaller der sikrer "pæne" tal og realistiske opgaver
- **Validering:** Svar skal altid give mening (ingen negative priser, brøker der kan forkortes korrekt osv.)
- **Sproget:** Alle opgavetekster på dansk, samme stil som de officielle FP9-prøver
