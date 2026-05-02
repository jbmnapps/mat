/**
 * Træningsopgaver for tabeller og gennemsnit.
 *
 * Gennemsnit: sum ÷ antal. Frekvens: hvor ofte forekommer.
 * Word problems trækker hverdagseksempler ind.
 */

import type { Opgave } from '../quiz-types';

export const tabellerOpgaver: Opgave[] = [
  {
    id: 'tab-01',
    type: 'numeric',
    spørgsmål: 'Find gennemsnittet af 4, 6 og 8.',
    svar: 6,
    forklaring: 'Tip: læg sammen og del med antal tal.',
  },
  {
    id: 'tab-02',
    type: 'numeric',
    spørgsmål: 'Find gennemsnittet af 5, 7, 9, 11.',
    svar: 8,
  },
  {
    id: 'tab-03',
    type: 'numeric',
    spørgsmål: 'Find gennemsnittet af 12, 14, 16, 18, 20.',
    svar: 16,
  },
  {
    id: 'tab-04',
    type: 'numeric',
    spørgsmål: 'En elevs karakterer er 7, 10, 12, 7. Hvad er gennemsnittet?',
    svar: 9,
  },
  {
    id: 'tab-05',
    type: 'numeric',
    spørgsmål: 'I en uge gik Anna 8 km, 5 km, 7 km, 6 km og 4 km. Hvad var hendes gennemsnit pr. dag?',
    svar: 6,
    enhed: 'km',
  },
  {
    id: 'tab-06',
    type: 'numeric',
    spørgsmål: 'Tre tal har gennemsnittet 10. Summen af tallene er ___?',
    svar: 30,
    forklaring: 'Tip: sum = gennemsnit · antal.',
  },
  {
    id: 'tab-07',
    type: 'numeric',
    spørgsmål: 'Anna fik 8, 6, 9 i tre prøver. Hvad skal hun have i den 4. prøve for at gennemsnittet bliver 8?',
    svar: 9,
    forklaring: 'Tip: gennemsnit 8 over 4 prøver = sum 32. Hvor meget mangler?',
  },
  {
    id: 'tab-08',
    type: 'numeric',
    spørgsmål: 'En tabel viser at 3 elever fik 7, 5 elever fik 10, 2 elever fik 12. Hvor mange elever er der i alt?',
    svar: 10,
    enhed: 'elever',
  },
  {
    id: 'tab-09',
    type: 'numeric',
    spørgsmål: 'Samme tabel: 3 elever fik 7, 5 elever fik 10, 2 elever fik 12. Hvad er gennemsnittet?',
    svar: 9.5,
    tolerance: 0.01,
    forklaring: 'Tip: sum = 3·7 + 5·10 + 2·12. Del med antal.',
  },
  {
    id: 'tab-10',
    type: 'numeric',
    spørgsmål: 'Tallene 5, 8, 8, 10, 14 er sorteret. Hvad er medianen?',
    svar: 8,
    forklaring: 'Tip: median = midterste tal når de er sorteret.',
  },
  {
    id: 'tab-11',
    type: 'numeric',
    spørgsmål: 'Tallene 4, 7, 7, 9, 10, 13 er sorteret. Hvad er medianen?',
    svar: 8,
    forklaring: 'Tip: lige antal tal? Tag gennemsnittet af de to midterste.',
  },
  {
    id: 'tab-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvilket tal er typetallet i: 3, 5, 5, 7, 5, 8, 5, 9?',
    muligheder: ['3', '5', '7', '9'],
    rigtigIndex: 1,
    forklaring: 'Tip: typetal = det tal der forekommer flest gange.',
  },
];
