/**
 * Træningsopgaver for subtraktion. FP9-niveau, hovedregning + papir-regning.
 *
 * Progression:
 *  - 1-2: warm-up (1-cifret, simpel 2-cifret)
 *  - 3-6: 2-3 cifret med lån
 *  - 7-8: lån over nul (sværeste mekanik)
 *  - 9-11: ord-opgaver fra hverdagen
 *  - 12: multiple choice der tester overslag
 */

import type { Opgave } from '../quiz-types';

export const subtraktionOpgaver: Opgave[] = [
  {
    id: 'sub-01',
    type: 'numeric',
    spørgsmål: 'Udregn: 14 − 6',
    svar: 8,
  },
  {
    id: 'sub-02',
    type: 'numeric',
    spørgsmål: 'Udregn: 78 − 32',
    svar: 46,
  },
  {
    id: 'sub-03',
    type: 'numeric',
    spørgsmål: 'Udregn: 73 − 28',
    svar: 45,
    forklaring: 'Tip: regn 73 − 30 først. Læg så 2 til svaret.',
  },
  {
    id: 'sub-04',
    type: 'numeric',
    spørgsmål: 'Udregn: 145 − 78',
    svar: 67,
  },
  {
    id: 'sub-05',
    type: 'numeric',
    spørgsmål: 'Udregn: 503 − 247',
    svar: 256,
    forklaring: 'Tip: tænk 503 som 500 + 3. Træk 247 fra 500 først.',
  },
  {
    id: 'sub-06',
    type: 'numeric',
    spørgsmål: 'Udregn: 1.245 − 867',
    svar: 378,
  },
  {
    id: 'sub-07',
    type: 'numeric',
    spørgsmål: 'Udregn: 1.000 − 487',
    svar: 513,
    forklaring: 'Tip: tænk 999 − 487 først (let), og læg så 1 til.',
  },
  {
    id: 'sub-08',
    type: 'numeric',
    spørgsmål: 'Hvad mangler? 100 − ___ = 37',
    svar: 63,
    forklaring: 'Tip: hvis 100 minus noget giver 37, er det noget = 100 − 37.',
  },
  {
    id: 'sub-09',
    type: 'numeric',
    spørgsmål: 'Lars har 250 kr. Han køber et spil til 179 kr. Hvor mange penge har han tilbage?',
    svar: 71,
    enhed: 'kr',
  },
  {
    id: 'sub-10',
    type: 'numeric',
    spørgsmål: 'I 9.B er der 27 elever. 13 er piger. Hvor mange drenge er der?',
    svar: 14,
    enhed: 'elever',
  },
  {
    id: 'sub-11',
    type: 'numeric',
    spørgsmål: 'Et tog kører 350 km. Det har kørt 187 km. Hvor langt er der tilbage?',
    svar: 163,
    enhed: 'km',
  },
  {
    id: 'sub-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvad er 802 − 199?',
    muligheder: ['593', '603', '613', '703'],
    rigtigIndex: 1,
    forklaring: 'Tip: 199 er næsten 200. Træk 200 fra, og læg 1 til bagefter.',
  },
];
