/**
 * Træningsopgaver for sandsynlighed.
 *
 * Mønter, terninger, kort, kombinatorik. Svar typisk som
 * brøk → tit som procent eller decimal. Tolerance giver
 * plads til afrunding (5%, 16,67%, 1/6 etc).
 */

import type { Opgave } from '../quiz-types';

export const sandsynlighedOpgaver: Opgave[] = [
  {
    id: 'san-01',
    type: 'numeric',
    spørgsmål: 'Hvad er sandsynligheden for at slå plat med en mønt? Skriv som procent.',
    svar: 50,
    enhed: '%',
  },
  {
    id: 'san-02',
    type: 'numeric',
    spørgsmål: 'Hvad er sandsynligheden for at slå en 6 med en terning? Skriv som procent (afrund til nærmeste hele).',
    svar: 17,
    tolerance: 1,
    enhed: '%',
    forklaring: 'Tip: 1/6 ≈ 0,167 = 16,7%.',
  },
  {
    id: 'san-03',
    type: 'numeric',
    spørgsmål: 'Hvad er sandsynligheden for at slå et lige tal med en terning? Skriv som procent.',
    svar: 50,
    enhed: '%',
    forklaring: 'Tip: 3 ud af 6 sider er lige (2, 4, 6).',
  },
  {
    id: 'san-04',
    type: 'numeric',
    spørgsmål: 'Hvor mange af terningens 6 sider giver et tal større end 4?',
    svar: 2,
    forklaring: 'Tip: hvilke tal på en terning er større end 4?',
  },
  {
    id: 'san-05',
    type: 'numeric',
    spørgsmål: 'I en pose ligger 3 røde og 2 blå bolde. Hvad er sandsynligheden for at trække en rød? Skriv som procent.',
    svar: 60,
    enhed: '%',
    forklaring: 'Tip: 3 ud af 5 = 60%.',
  },
  {
    id: 'san-06',
    type: 'numeric',
    spørgsmål: 'Du kaster en mønt to gange. Hvor mange forskellige udfald er der?',
    svar: 4,
    forklaring: 'Tip: PP, PK, KP, KK.',
  },
  {
    id: 'san-07',
    type: 'numeric',
    spørgsmål: 'Du kaster to terninger. Hvor mange forskellige udfald er der?',
    svar: 36,
    forklaring: 'Tip: 6 muligheder for første · 6 muligheder for anden.',
  },
  {
    id: 'san-08',
    type: 'numeric',
    spørgsmål: 'I en pose er der 10 bolde, hvoraf 4 er røde. Hvad er sandsynligheden for IKKE at trække en rød? Skriv som procent.',
    svar: 60,
    enhed: '%',
    forklaring: 'Tip: 10 − 4 = 6 ikke-røde. 6 ud af 10.',
  },
  {
    id: 'san-09',
    type: 'numeric',
    spørgsmål: 'En spinner har 8 lige store felter, nummereret 1-8. Hvad er sandsynligheden for at lande på et tal større end 6? Skriv som procent.',
    svar: 25,
    enhed: '%',
    forklaring: 'Tip: 7 og 8 er over 6 — det er 2 ud af 8.',
  },
  {
    id: 'san-10',
    type: 'numeric',
    spørgsmål: 'Du trækker et kort fra et almindeligt sæt på 52 kort. Hvad er sandsynligheden for at det er et hjerter? Skriv som procent.',
    svar: 25,
    enhed: '%',
    forklaring: 'Tip: 13 hjerter ud af 52 kort = 1/4.',
  },
  {
    id: 'san-11',
    type: 'numeric',
    spørgsmål: 'Du har 3 bukser og 4 trøjer. Hvor mange forskellige tøjkombinationer kan du lave?',
    svar: 12,
    enhed: 'kombinationer',
    forklaring: 'Tip: gange antallene sammen.',
  },
  {
    id: 'san-12',
    type: 'multiple-choice',
    spørgsmål: 'En pose har 5 bolde: 1 rød, 2 blå, 2 grønne. Hvad er mest sandsynligt at trække?',
    muligheder: ['Rød', 'Kun blå', 'Kun grøn', 'Blå eller grøn (samme)'],
    rigtigIndex: 3,
    forklaring: 'Tip: blå og grøn har samme antal — to af hver.',
  },
];
