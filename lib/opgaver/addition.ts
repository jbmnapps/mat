/**
 * Træningsopgaver for addition. FP9-niveau, hovedregning + papir-regning.
 *
 * Progression:
 *  - 1-2: warm-up (1-cifret + simpel 2-cifret)
 *  - 3-6: 2-3 cifret med mente
 *  - 7-8: tre addender / store tal
 *  - 9-11: ord-opgaver fra hverdagen
 *  - 12: multiple choice der tester overslag + præcision
 */

import type { Opgave } from '../quiz-types';

export const additionOpgaver: Opgave[] = [
  {
    id: 'add-01',
    type: 'numeric',
    spørgsmål: 'Udregn: 8 + 7',
    svar: 15,
  },
  {
    id: 'add-02',
    type: 'numeric',
    spørgsmål: 'Udregn: 23 + 45',
    svar: 68,
  },
  {
    id: 'add-03',
    type: 'numeric',
    spørgsmål: 'Udregn: 27 + 38',
    svar: 65,
    forklaring: 'Tip: enerne giver 15 — husk mente 1 oppe i tier-søjlen.',
  },
  {
    id: 'add-04',
    type: 'numeric',
    spørgsmål: 'Udregn: 56 + 79',
    svar: 135,
  },
  {
    id: 'add-05',
    type: 'numeric',
    spørgsmål: 'Udregn: 134 + 256',
    svar: 390,
  },
  {
    id: 'add-06',
    type: 'numeric',
    spørgsmål: 'Udregn: 287 + 456',
    svar: 743,
  },
  {
    id: 'add-07',
    type: 'numeric',
    spørgsmål: 'Udregn: 47 + 28 + 19',
    svar: 94,
    forklaring: 'Tip: læg to ad gangen sammen først, læg så det tredje til.',
  },
  {
    id: 'add-08',
    type: 'numeric',
    spørgsmål: 'Hvad mangler? 65 + ___ = 100',
    svar: 35,
    forklaring: 'Tip: hvor langt er der fra 65 op til 100?',
  },
  {
    id: 'add-09',
    type: 'numeric',
    spørgsmål: 'I 9.A er der 14 piger og 12 drenge. Hvor mange elever er der i alt?',
    svar: 26,
    enhed: 'elever',
  },
  {
    id: 'add-10',
    type: 'numeric',
    spørgsmål: 'Anna sparede 287 kr i marts og 156 kr i april. Hvor meget har hun sparet i alt?',
    svar: 443,
    enhed: 'kr',
  },
  {
    id: 'add-11',
    type: 'numeric',
    spørgsmål: 'En cykel koster 1.450 kr. Hjelmen koster 299 kr. Hvad koster det tilsammen?',
    svar: 1749,
    enhed: 'kr',
    forklaring: 'Tip: 299 er næsten 300. Læg 300 til, og træk 1 fra bagefter.',
  },
  {
    id: 'add-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvad er 199 + 199?',
    muligheder: ['388', '398', '400', '408'],
    rigtigIndex: 1,
    forklaring: 'Tip: tænk 200 + 200, og træk lidt fra.',
  },
];
