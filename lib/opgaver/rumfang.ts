/**
 * Træningsopgaver for rumfang og areal. FP9-niveau uden hjælpemidler.
 *
 * Fokus på rektangler, trekanter, kasser. Cirkel og prismer med
 * uregelmæssige grundflader gemt til prøven med hjælpemidler.
 */

import type { Opgave } from '../quiz-types';

export const rumfangOpgaver: Opgave[] = [
  {
    id: 'rum-01',
    type: 'numeric',
    spørgsmål: 'Et rektangel har sider på 8 cm og 5 cm. Hvad er arealet?',
    svar: 40,
    enhed: 'cm²',
    forklaring: 'Tip: areal = længde · bredde.',
  },
  {
    id: 'rum-02',
    type: 'numeric',
    spørgsmål: 'Et rektangel har sider på 8 cm og 5 cm. Hvad er omkredsen?',
    svar: 26,
    enhed: 'cm',
    forklaring: 'Tip: omkreds = 2 · (længde + bredde).',
  },
  {
    id: 'rum-03',
    type: 'numeric',
    spørgsmål: 'Et kvadrat har en side på 7 cm. Hvad er arealet?',
    svar: 49,
    enhed: 'cm²',
    forklaring: 'Tip: kvadrat har alle sider lige lange. Areal = side · side.',
  },
  {
    id: 'rum-04',
    type: 'numeric',
    spørgsmål: 'En trekant har grundlinje 10 cm og højde 6 cm. Hvad er arealet?',
    svar: 30,
    enhed: 'cm²',
    forklaring: 'Tip: areal af trekant = (grundlinje · højde) ÷ 2.',
  },
  {
    id: 'rum-05',
    type: 'numeric',
    spørgsmål: 'En trekant har grundlinje 12 cm og højde 5 cm. Hvad er arealet?',
    svar: 30,
    enhed: 'cm²',
  },
  {
    id: 'rum-06',
    type: 'numeric',
    spørgsmål: 'En kasse har sider på 4 cm, 5 cm og 6 cm. Hvad er rumfanget?',
    svar: 120,
    enhed: 'cm³',
    forklaring: 'Tip: rumfang af kasse = længde · bredde · højde.',
  },
  {
    id: 'rum-07',
    type: 'numeric',
    spørgsmål: 'En terning har sider på 3 cm. Hvad er rumfanget?',
    svar: 27,
    enhed: 'cm³',
    forklaring: 'Tip: terning = alle sider ens. Rumfang = side³.',
  },
  {
    id: 'rum-08',
    type: 'numeric',
    spørgsmål: 'En akvarie er 50 cm langt, 30 cm bredt og 40 cm højt. Hvor mange liter rummer det?',
    svar: 60,
    enhed: 'L',
    forklaring: 'Tip: 1000 cm³ = 1 L. Regn rumfang i cm³ først.',
  },
  {
    id: 'rum-09',
    type: 'numeric',
    spørgsmål: 'Et rektangel har areal 48 cm² og længde 8 cm. Hvad er bredden?',
    svar: 6,
    enhed: 'cm',
    forklaring: 'Tip: areal = længde · bredde, så bredden = areal ÷ længde.',
  },
  {
    id: 'rum-10',
    type: 'numeric',
    spørgsmål: 'En have er 12 m lang og 8 m bred. Hvor mange m hegn skal du bruge til at lukke den helt inde?',
    svar: 40,
    enhed: 'm',
    forklaring: 'Tip: hegn = omkreds. To gange længde + to gange bredde.',
  },
  {
    id: 'rum-11',
    type: 'numeric',
    spørgsmål: 'En trekant har areal 24 cm² og grundlinje 8 cm. Hvad er højden?',
    svar: 6,
    enhed: 'cm',
    forklaring: 'Tip: areal = (g · h) ÷ 2, så h = (areal · 2) ÷ g.',
  },
  {
    id: 'rum-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvilket rumfang har størst værdi?',
    muligheder: ['Kasse 2·3·5 cm', 'Terning 4·4·4 cm', 'Kasse 3·3·6 cm', 'Kasse 5·5·2 cm'],
    rigtigIndex: 1,
    forklaring: 'Tip: regn alle ud — det er bare gange.',
  },
];
