/**
 * Træningsopgaver for division. FP9-niveau, hovedregning + papir-regning.
 *
 * Progression:
 *  - 1-3: gangetabeller baglæns (skal sidde fast)
 *  - 4-6: 2-cifret : 1-cifret
 *  - 7-8: division med rest
 *  - 9-11: ord-opgaver (deling, stykpris)
 *  - 12: multiple choice
 */

import type { Opgave } from '../quiz-types';

export const divisionOpgaver: Opgave[] = [
  {
    id: 'div-01',
    type: 'numeric',
    spørgsmål: 'Udregn: 56 : 8',
    svar: 7,
  },
  {
    id: 'div-02',
    type: 'numeric',
    spørgsmål: 'Udregn: 72 : 9',
    svar: 8,
  },
  {
    id: 'div-03',
    type: 'numeric',
    spørgsmål: 'Udregn: 64 : 4',
    svar: 16,
    forklaring: 'Tip: 60 : 4 = 15, og 4 : 4 = 1. Læg sammen.',
  },
  {
    id: 'div-04',
    type: 'numeric',
    spørgsmål: 'Udregn: 96 : 6',
    svar: 16,
  },
  {
    id: 'div-05',
    type: 'numeric',
    spørgsmål: 'Udregn: 156 : 12',
    svar: 13,
    forklaring: 'Tip: 12 · 10 = 120, og der mangler 36 = 12 · 3.',
  },
  {
    id: 'div-06',
    type: 'numeric',
    spørgsmål: 'Udregn: 3.500 : 100',
    svar: 35,
    forklaring: 'Tip: dividere med 100 = fjern to nuller.',
  },
  {
    id: 'div-07',
    type: 'numeric',
    spørgsmål: 'Hvor mange hele gange går 7 op i 38?',
    svar: 5,
    forklaring: 'Tip: 7 · 5 = 35. Det er det største antal hele 7-tabeller under 38.',
  },
  {
    id: 'div-08',
    type: 'numeric',
    spørgsmål: 'Hvad er resten når 50 deles med 6?',
    svar: 2,
    forklaring: 'Tip: 6 · 8 = 48. 50 − 48 = rest.',
  },
  {
    id: 'div-09',
    type: 'numeric',
    spørgsmål: '3 venner deler 84 kr ligeligt. Hvor meget får hver?',
    svar: 28,
    enhed: 'kr',
  },
  {
    id: 'div-10',
    type: 'numeric',
    spørgsmål: 'En pose med 6 æbler koster 24 kr. Hvad koster ét æble?',
    svar: 4,
    enhed: 'kr',
  },
  {
    id: 'div-11',
    type: 'numeric',
    spørgsmål: 'En klasse på 28 elever skal i grupper af 4. Hvor mange grupper bliver der?',
    svar: 7,
    enhed: 'grupper',
  },
  {
    id: 'div-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvad er 480 : 8?',
    muligheder: ['50', '60', '70', '80'],
    rigtigIndex: 1,
    forklaring: 'Tip: 8 · 6 = 48, så 8 · 60 = 480.',
  },
];
