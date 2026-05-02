/**
 * Træningsopgaver for multiplikation. FP9-niveau, hovedregning + papir-regning.
 *
 * Progression:
 *  - 1-3: gangetabeller (skal sidde fast)
 *  - 4-6: 1-cifret · 2-cifret + 10-trin
 *  - 7-8: 2-cifret · 2-cifret (papir-regning)
 *  - 9-11: ord-opgaver
 *  - 12: multiple choice der tester overslag
 */

import type { Opgave } from '../quiz-types';

export const multiplikationOpgaver: Opgave[] = [
  {
    id: 'mul-01',
    type: 'numeric',
    spørgsmål: 'Udregn: 7 · 8',
    svar: 56,
  },
  {
    id: 'mul-02',
    type: 'numeric',
    spørgsmål: 'Udregn: 6 · 9',
    svar: 54,
  },
  {
    id: 'mul-03',
    type: 'numeric',
    spørgsmål: 'Udregn: 12 · 7',
    svar: 84,
    forklaring: 'Tip: del op i 10 · 7 + 2 · 7 = 70 + 14.',
  },
  {
    id: 'mul-04',
    type: 'numeric',
    spørgsmål: 'Udregn: 25 · 4',
    svar: 100,
    forklaring: 'Tip: 25 · 4 er det samme som en 100-kroneseddel.',
  },
  {
    id: 'mul-05',
    type: 'numeric',
    spørgsmål: 'Udregn: 35 · 100',
    svar: 3500,
    forklaring: 'Tip: gange med 100 = sæt to nuller på.',
  },
  {
    id: 'mul-06',
    type: 'numeric',
    spørgsmål: 'Udregn: 8 · 45',
    svar: 360,
  },
  {
    id: 'mul-07',
    type: 'numeric',
    spørgsmål: 'Udregn: 12 · 15',
    svar: 180,
    forklaring: 'Tip: 12 · 15 = 12 · 10 + 12 · 5.',
  },
  {
    id: 'mul-08',
    type: 'numeric',
    spørgsmål: 'Udregn: 23 · 14',
    svar: 322,
  },
  {
    id: 'mul-09',
    type: 'numeric',
    spørgsmål: 'En billet til biografen koster 95 kr. Hvad koster 6 billetter?',
    svar: 570,
    enhed: 'kr',
  },
  {
    id: 'mul-10',
    type: 'numeric',
    spørgsmål: 'Anna spiser 8 frugter om dagen. Hvor mange spiser hun på 14 dage?',
    svar: 112,
    enhed: 'frugter',
  },
  {
    id: 'mul-11',
    type: 'numeric',
    spørgsmål: 'Et abonnement koster 79 kr om måneden. Hvad koster et helt år?',
    svar: 948,
    enhed: 'kr',
  },
  {
    id: 'mul-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvad er 39 · 11?',
    muligheder: ['399', '419', '429', '459'],
    rigtigIndex: 2,
    forklaring: 'Tip: 39 · 11 = 39 · 10 + 39. Brug 10-trick.',
  },
];
