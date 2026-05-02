/**
 * Træningsopgaver for procent og brøk. FP9 hovedindhold uden hjælpemidler.
 *
 * Progression:
 *  - 1-3: simpel "% af tal"-beregning (hovedregning-venlige tal)
 *  - 4-6: rabat og stigning fra hverdagen
 *  - 7-9: brøk ↔ procent ↔ decimal-omregning
 *  - 10-11: ord-opgaver
 *  - 12: multiple choice
 */

import type { Opgave } from '../quiz-types';

export const procentOpgaver: Opgave[] = [
  {
    id: 'pct-01',
    type: 'numeric',
    spørgsmål: 'Hvad er 10% af 250?',
    svar: 25,
    forklaring: 'Tip: 10% er det samme som at dividere med 10.',
  },
  {
    id: 'pct-02',
    type: 'numeric',
    spørgsmål: 'Hvad er 25% af 80?',
    svar: 20,
    forklaring: 'Tip: 25% = 1/4 af tallet.',
  },
  {
    id: 'pct-03',
    type: 'numeric',
    spørgsmål: 'Hvad er 50% af 340?',
    svar: 170,
    forklaring: 'Tip: 50% = halvdelen.',
  },
  {
    id: 'pct-04',
    type: 'numeric',
    spørgsmål: 'En jakke koster 800 kr. Den er nedsat 25%. Hvor meget er rabatten?',
    svar: 200,
    enhed: 'kr',
    forklaring: 'Tip: 25% af 800 — del med 4.',
  },
  {
    id: 'pct-05',
    type: 'numeric',
    spørgsmål: 'En jakke koster 800 kr. Den er nedsat 25%. Hvad koster den nu?',
    svar: 600,
    enhed: 'kr',
    forklaring: 'Tip: regn rabatten ud først, og træk den fra prisen.',
  },
  {
    id: 'pct-06',
    type: 'numeric',
    spørgsmål: 'Et abonnement stiger fra 100 kr til 120 kr. Hvor mange procent er det steget?',
    svar: 20,
    enhed: '%',
    forklaring: 'Tip: stigning ÷ startværdi · 100.',
  },
  {
    id: 'pct-07',
    type: 'numeric',
    spørgsmål: 'Skriv 3/4 som procent.',
    svar: 75,
    enhed: '%',
    forklaring: 'Tip: 1/4 = 25%, så 3/4 = 3 · 25%.',
  },
  {
    id: 'pct-08',
    type: 'numeric',
    spørgsmål: 'Skriv 1/5 som procent.',
    svar: 20,
    enhed: '%',
    forklaring: 'Tip: omskriv brøken så nævneren bliver 100.',
  },
  {
    id: 'pct-09',
    type: 'numeric',
    spørgsmål: 'Skriv 0,4 som procent.',
    svar: 40,
    enhed: '%',
    forklaring: 'Tip: gange decimaltal med 100 for at få procent.',
  },
  {
    id: 'pct-10',
    type: 'numeric',
    spørgsmål: 'I en klasse på 25 elever er 60% piger. Hvor mange piger er der?',
    svar: 15,
    enhed: 'piger',
    forklaring: 'Tip: 60% af 25. Tag halvdelen + 10% til.',
  },
  {
    id: 'pct-11',
    type: 'numeric',
    spørgsmål: 'En vare koster 450 kr inkl. 25% moms. Hvad er prisen uden moms?',
    svar: 360,
    enhed: 'kr',
    forklaring: 'Tip: prisen med moms svarer til 125% af prisen uden moms.',
  },
  {
    id: 'pct-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvilken brøk er størst?',
    muligheder: ['1/2', '2/5', '3/8', '4/9'],
    rigtigIndex: 0,
    forklaring: 'Tip: skriv dem som decimal eller procent og sammenlign.',
  },
];
