/**
 * Træningsopgaver for diagrammer (søjle- og linjediagrammer).
 *
 * Beskriver værdierne i tekst (ingen grafik) og stiller spørgsmål
 * der kræver aflæsning + sammenligning + simple beregninger.
 */

import type { Opgave } from '../quiz-types';

export const diagrammerOpgaver: Opgave[] = [
  {
    id: 'dia-01',
    type: 'numeric',
    spørgsmål:
      'Et søjlediagram viser elever pr. klasse: 9.A har 24, 9.B har 27, 9.C har 22. Hvor mange elever er der i alt?',
    svar: 73,
    enhed: 'elever',
  },
  {
    id: 'dia-02',
    type: 'numeric',
    spørgsmål:
      'Samme diagram: 9.A 24, 9.B 27, 9.C 22. Hvor mange flere er der i 9.B end i 9.C?',
    svar: 5,
    enhed: 'elever',
  },
  {
    id: 'dia-03',
    type: 'numeric',
    spørgsmål:
      'Et linjediagram viser temperatur kl. 8: 5°, kl. 12: 12°, kl. 16: 15°, kl. 20: 9°. Hvad er forskellen mellem den højeste og laveste temperatur?',
    svar: 10,
    enhed: '°',
  },
  {
    id: 'dia-04',
    type: 'numeric',
    spørgsmål:
      'Samme diagram (5°, 12°, 15°, 9°). Hvor meget steg temperaturen fra kl. 8 til kl. 12?',
    svar: 7,
    enhed: '°',
  },
  {
    id: 'dia-05',
    type: 'numeric',
    spørgsmål:
      'Et søjlediagram viser solgte pizza-typer: Margherita 18, Pepperoni 24, Hawaii 15, Vegetar 13. Hvor mange pizzaer blev solgt i alt?',
    svar: 70,
  },
  {
    id: 'dia-06',
    type: 'multiple-choice',
    spørgsmål:
      'Pizza-diagrammet (Marg 18, Pep 24, Haw 15, Veg 13). Hvilken type blev solgt mest?',
    muligheder: ['Margherita', 'Pepperoni', 'Hawaii', 'Vegetar'],
    rigtigIndex: 1,
  },
  {
    id: 'dia-07',
    type: 'numeric',
    spørgsmål:
      'Pizza-diagrammet igen: 70 i alt, hvoraf 24 er Pepperoni. Hvor mange procent er Pepperoni? (afrund til nærmeste hele)',
    svar: 34,
    tolerance: 1,
    enhed: '%',
    forklaring: 'Tip: 24/70 ≈ 0,34 = 34%.',
  },
  {
    id: 'dia-08',
    type: 'numeric',
    spørgsmål:
      'Et linjediagram viser at en planta voksede 2 cm i januar, 4 cm i februar, 8 cm i marts, 6 cm i april. Hvor mange cm i alt over de 4 måneder?',
    svar: 20,
    enhed: 'cm',
  },
  {
    id: 'dia-09',
    type: 'numeric',
    spørgsmål:
      'En tabel: 6 elever bruger 1 time, 12 elever bruger 2 timer, 8 elever bruger 3 timer på lektier. Hvor mange elever er der i alt?',
    svar: 26,
    enhed: 'elever',
  },
  {
    id: 'dia-10',
    type: 'numeric',
    spørgsmål:
      'Samme tabel (6, 12, 8 elever på 1, 2, 3 timer). Hvad er det samlede antal lektie-timer?',
    svar: 54,
    enhed: 'timer',
    forklaring: 'Tip: 6·1 + 12·2 + 8·3.',
  },
  {
    id: 'dia-11',
    type: 'numeric',
    spørgsmål:
      'Et cirkeldiagram viser at 50% af eleverne cykler, 25% går, 15% bus, 10% andet. Hvis der er 200 elever, hvor mange cykler så?',
    svar: 100,
    enhed: 'elever',
  },
  {
    id: 'dia-12',
    type: 'multiple-choice',
    spørgsmål:
      'Et linjediagram viser at salget falder hver måned. I jan: 100, feb: 90, mar: 81, apr: 73. Hvad sker der med faldet pr. måned?',
    muligheder: [
      'Det er ens hver måned',
      'Det bliver mindre',
      'Det bliver større',
      'Det skifter retning',
    ],
    rigtigIndex: 1,
    forklaring: 'Tip: regn forskellene: jan→feb, feb→mar, mar→apr. Bliver de mindre eller større?',
  },
];
