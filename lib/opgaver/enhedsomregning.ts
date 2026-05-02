/**
 * Træningsopgaver for enhedsomregning. FP9-niveau.
 *
 * Dækker længde, rumfang og masse — ingen lommeregner nødvendig
 * når man kender 10/100/1000-faktorerne.
 */

import type { Opgave } from '../quiz-types';

export const enhedsomregningOpgaver: Opgave[] = [
  {
    id: 'enh-01',
    type: 'numeric',
    spørgsmål: 'Hvor mange cm er 3 m?',
    svar: 300,
    enhed: 'cm',
    forklaring: 'Tip: 1 m = 100 cm.',
  },
  {
    id: 'enh-02',
    type: 'numeric',
    spørgsmål: 'Hvor mange mm er 7 cm?',
    svar: 70,
    enhed: 'mm',
    forklaring: 'Tip: 1 cm = 10 mm.',
  },
  {
    id: 'enh-03',
    type: 'numeric',
    spørgsmål: 'Hvor mange m er 2,5 km?',
    svar: 2500,
    enhed: 'm',
    forklaring: 'Tip: 1 km = 1000 m.',
  },
  {
    id: 'enh-04',
    type: 'numeric',
    spørgsmål: 'Hvor mange km er 4500 m?',
    svar: 4.5,
    tolerance: 0.01,
    enhed: 'km',
    forklaring: 'Tip: del med 1000.',
  },
  {
    id: 'enh-05',
    type: 'numeric',
    spørgsmål: 'Hvor mange mL er 2 L?',
    svar: 2000,
    enhed: 'mL',
    forklaring: 'Tip: 1 L = 1000 mL.',
  },
  {
    id: 'enh-06',
    type: 'numeric',
    spørgsmål: 'Hvor mange dL er 3 L?',
    svar: 30,
    enhed: 'dL',
    forklaring: 'Tip: 1 L = 10 dL.',
  },
  {
    id: 'enh-07',
    type: 'numeric',
    spørgsmål: 'Hvor mange L er 750 mL?',
    svar: 0.75,
    tolerance: 0.01,
    enhed: 'L',
  },
  {
    id: 'enh-08',
    type: 'numeric',
    spørgsmål: 'Hvor mange g er 1,5 kg?',
    svar: 1500,
    enhed: 'g',
    forklaring: 'Tip: 1 kg = 1000 g.',
  },
  {
    id: 'enh-09',
    type: 'numeric',
    spørgsmål: 'Hvor mange kg er 2300 g?',
    svar: 2.3,
    tolerance: 0.01,
    enhed: 'kg',
  },
  {
    id: 'enh-10',
    type: 'numeric',
    spørgsmål: 'Anna går 850 m til skole hver dag. Hvor mange km går hun på 5 dage (kun derhen, ikke hjem igen)?',
    svar: 4.25,
    tolerance: 0.01,
    enhed: 'km',
    forklaring: 'Tip: regn samlet i meter først, og lav om til km til sidst.',
  },
  {
    id: 'enh-11',
    type: 'numeric',
    spørgsmål: 'En flaske rummer 1,5 L. Hvor mange dL er det?',
    svar: 15,
    enhed: 'dL',
  },
  {
    id: 'enh-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvad er størst?',
    muligheder: ['450 g', '0,5 kg', '480 g', '6 hg'],
    rigtigIndex: 3,
    forklaring: 'Tip: 1 hg = 100 g. Lav alt om til g og sammenlign.',
  },
];
