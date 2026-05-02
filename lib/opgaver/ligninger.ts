/**
 * Træningsopgaver for ligninger. Find x.
 *
 * Progression:
 *  - 1-3: enkle additions/subtraktions-ligninger
 *  - 4-6: multiplikation/division
 *  - 7-9: kombineret (2x + 3 = 11)
 *  - 10-11: ord-opgaver der oversættes til ligninger
 *  - 12: multiple choice
 */

import type { Opgave } from '../quiz-types';

export const ligningerOpgaver: Opgave[] = [
  {
    id: 'lig-01',
    type: 'numeric',
    spørgsmål: 'Find x: x + 5 = 12',
    svar: 7,
    forklaring: 'Tip: træk 5 fra på begge sider af lighedstegnet.',
  },
  {
    id: 'lig-02',
    type: 'numeric',
    spørgsmål: 'Find x: x − 8 = 15',
    svar: 23,
    forklaring: 'Tip: læg 8 til på begge sider.',
  },
  {
    id: 'lig-03',
    type: 'numeric',
    spørgsmål: 'Find x: 20 = x + 7',
    svar: 13,
  },
  {
    id: 'lig-04',
    type: 'numeric',
    spørgsmål: 'Find x: 2x = 14',
    svar: 7,
    forklaring: 'Tip: del med 2 på begge sider.',
  },
  {
    id: 'lig-05',
    type: 'numeric',
    spørgsmål: 'Find x: 5x = 45',
    svar: 9,
  },
  {
    id: 'lig-06',
    type: 'numeric',
    spørgsmål: 'Find x: x : 3 = 4',
    svar: 12,
    forklaring: 'Tip: gange med 3 på begge sider.',
  },
  {
    id: 'lig-07',
    type: 'numeric',
    spørgsmål: 'Find x: 2x + 3 = 11',
    svar: 4,
    forklaring: 'Tip: træk 3 fra først, så del med 2.',
  },
  {
    id: 'lig-08',
    type: 'numeric',
    spørgsmål: 'Find x: 3x − 5 = 16',
    svar: 7,
    forklaring: 'Tip: læg 5 til først, så del med 3.',
  },
  {
    id: 'lig-09',
    type: 'numeric',
    spørgsmål: 'Find x: 4x + 8 = 32',
    svar: 6,
  },
  {
    id: 'lig-10',
    type: 'numeric',
    spørgsmål: 'Anna er x år. Lars er 3 år ældre. Lars er 14 år. Hvor gammel er Anna?',
    svar: 11,
    enhed: 'år',
    forklaring: 'Tip: skriv en ligning med x og find værdien.',
  },
  {
    id: 'lig-11',
    type: 'numeric',
    spørgsmål: '5 ens billetter koster 425 kr. Hvad koster én billet?',
    svar: 85,
    enhed: 'kr',
    forklaring: 'Tip: hvis 5 stykker koster 425, koster 1 stykke 425 ÷ noget.',
  },
  {
    id: 'lig-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvilken værdi af x løser ligningen 3x − 7 = 14?',
    muligheder: ['5', '6', '7', '21'],
    rigtigIndex: 2,
    forklaring: 'Tip: læg 7 til, så del med 3.',
  },
];
