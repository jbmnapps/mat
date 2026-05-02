/**
 * Træningsopgaver for hverdagsregning. Blandede ord-opgaver der
 * minder om dem på FP9 — priser, mængder, sammenligning, tid.
 *
 * Ingen rene regnestykker — alle er kontekstuelle.
 */

import type { Opgave } from '../quiz-types';

export const hverdagsregningOpgaver: Opgave[] = [
  {
    id: 'hvd-01',
    type: 'numeric',
    spørgsmål: 'Et brød koster 28 kr. Hvad koster 5 brød?',
    svar: 140,
    enhed: 'kr',
  },
  {
    id: 'hvd-02',
    type: 'numeric',
    spørgsmål: 'Du betaler 200 kr for varer til 137 kr. Hvor meget får du tilbage?',
    svar: 63,
    enhed: 'kr',
  },
  {
    id: 'hvd-03',
    type: 'numeric',
    spørgsmål: 'Du går fra kl. 14:30 til kl. 15:55. Hvor mange minutter har du brugt?',
    svar: 85,
    enhed: 'min',
    forklaring: 'Tip: 30 min op til 15:00, og 55 min derfra.',
  },
  {
    id: 'hvd-04',
    type: 'numeric',
    spørgsmål: '6 liter saft koster 90 kr. Hvad koster 1 liter?',
    svar: 15,
    enhed: 'kr',
  },
  {
    id: 'hvd-05',
    type: 'numeric',
    spørgsmål: 'En pose med 12 boller koster 36 kr. En enkelt bolle koster 4 kr i en anden butik. Hvor mange kr sparer du pr. bolle ved at købe posen?',
    svar: 1,
    enhed: 'kr',
    forklaring: 'Tip: 36 ÷ 12 = pris pr. bolle i pose. Sammenlign med 4 kr.',
  },
  {
    id: 'hvd-06',
    type: 'numeric',
    spørgsmål: 'En opskrift til 4 personer kræver 200 g sukker. Hvor meget skal du bruge til 6 personer?',
    svar: 300,
    enhed: 'g',
    forklaring: 'Tip: 200 g per 4 personer = 50 g per person.',
  },
  {
    id: 'hvd-07',
    type: 'numeric',
    spørgsmål: 'En cykeltur er 24 km. Du har kørt 1/3. Hvor mange km mangler?',
    svar: 16,
    enhed: 'km',
    forklaring: 'Tip: 1/3 = 8 km. Træk fra de 24.',
  },
  {
    id: 'hvd-08',
    type: 'numeric',
    spørgsmål: 'En vare koster 240 kr. Du sparer 60 kr på et tilbud. Hvor mange procent er rabatten?',
    svar: 25,
    enhed: '%',
    forklaring: 'Tip: 60 ud af 240 — forenkl brøken.',
  },
  {
    id: 'hvd-09',
    type: 'numeric',
    spørgsmål: 'En bus kører 12 km på en halv time. Hvor langt kører den på en hel time?',
    svar: 24,
    enhed: 'km',
  },
  {
    id: 'hvd-10',
    type: 'numeric',
    spørgsmål: 'I en pose er der 30 slik. Anna spiser 6, Lars spiser dobbelt så mange som Anna. Hvor mange er tilbage?',
    svar: 12,
    enhed: 'slik',
    forklaring: 'Tip: Lars spiser 2 · 6 = 12. Træk Anna + Lars fra 30.',
  },
  {
    id: 'hvd-11',
    type: 'numeric',
    spørgsmål: 'En vandhane drypper 30 dråber i minuttet. Hvor mange dråber er det på en time?',
    svar: 1800,
    enhed: 'dråber',
    forklaring: 'Tip: 60 minutter på en time. Gang.',
  },
  {
    id: 'hvd-12',
    type: 'multiple-choice',
    spørgsmål: '500 g pasta koster 12 kr. 1 kg pasta koster 20 kr i en anden butik. Hvor er prisen pr. kg billigst?',
    muligheder: ['Første butik (12 kr/500g)', 'Anden butik (20 kr/kg)', 'Samme pris', 'Kan ikke afgøres'],
    rigtigIndex: 1,
    forklaring: 'Tip: regn ud hvad 1 kg koster i første butik (= 2 · 500 g).',
  },
];
