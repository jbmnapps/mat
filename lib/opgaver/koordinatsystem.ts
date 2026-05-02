/**
 * Træningsopgaver for koordinatsystem. FP9-niveau uden hjælpemidler.
 *
 * Tekstuelle opgaver — ingen grafik. Fokus på:
 *  - Aflæsning af punkter (med beskrivelse)
 *  - Linjer y = ax + b (find y givet x)
 *  - Afstand på samme akse
 *  - Kvadrant-identifikation
 */

import type { Opgave } from '../quiz-types';

export const koordinatsystemOpgaver: Opgave[] = [
  {
    id: 'koo-01',
    type: 'numeric',
    spørgsmål: 'Punktet A har koordinaterne (3, 5). Hvad er y-koordinaten?',
    svar: 5,
    forklaring: 'Tip: i (x, y) er det andet tal y.',
  },
  {
    id: 'koo-02',
    type: 'numeric',
    spørgsmål: 'Et punkt ligger på linjen y = 2x. Hvis x = 4, hvad er y så?',
    svar: 8,
    forklaring: 'Tip: indsæt x i ligningen.',
  },
  {
    id: 'koo-03',
    type: 'numeric',
    spørgsmål: 'Et punkt ligger på linjen y = 3x − 1. Hvis x = 2, hvad er y så?',
    svar: 5,
  },
  {
    id: 'koo-04',
    type: 'numeric',
    spørgsmål: 'Punkt A er (2, 3). Punkt B er (7, 3). Hvor langt er der mellem dem?',
    svar: 5,
    forklaring: 'Tip: samme y, så afstanden er forskellen i x.',
  },
  {
    id: 'koo-05',
    type: 'numeric',
    spørgsmål: 'Punkt A er (4, 1). Punkt B er (4, 6). Hvor langt er der mellem dem?',
    svar: 5,
    forklaring: 'Tip: samme x, så afstanden er forskellen i y.',
  },
  {
    id: 'koo-06',
    type: 'numeric',
    spørgsmål: 'Et punkt ligger på linjen y = x + 4. Hvis x = 3, hvad er y så?',
    svar: 7,
  },
  {
    id: 'koo-07',
    type: 'multiple-choice',
    spørgsmål: 'Punktet (0, 5) — på hvilken akse ligger det?',
    muligheder: ['x-aksen', 'y-aksen', 'Begge', 'Ingen'],
    rigtigIndex: 1,
    forklaring: 'Tip: punkter med x = 0 ligger på y-aksen.',
  },
  {
    id: 'koo-08',
    type: 'numeric',
    spørgsmål: 'Linjen y = 2x går gennem (0, 0). Hvilken y-værdi har punktet hvor x = 5?',
    svar: 10,
  },
  {
    id: 'koo-09',
    type: 'multiple-choice',
    spørgsmål: 'Hvilket punkt ligger i 2. kvadrant (negativ x, positiv y)?',
    muligheder: ['(3, 4)', '(−2, 5)', '(4, −3)', '(−5, −1)'],
    rigtigIndex: 1,
  },
  {
    id: 'koo-10',
    type: 'multiple-choice',
    spørgsmål: 'Hvilket punkt ligger på linjen y = 3x?',
    muligheder: ['(2, 5)', '(3, 6)', '(4, 12)', '(5, 8)'],
    rigtigIndex: 2,
    forklaring: 'Tip: tjek hvert punkt — er y faktisk 3 · x?',
  },
  {
    id: 'koo-11',
    type: 'numeric',
    spørgsmål: 'Linjen y = 2x + 3 skærer y-aksen. Hvad er y-værdien dér?',
    svar: 3,
    forklaring: 'Tip: y-aksen er der hvor x = 0.',
  },
  {
    id: 'koo-12',
    type: 'multiple-choice',
    spørgsmål: 'Hvilken linje har den stejleste hældning?',
    muligheder: ['y = x', 'y = 2x', 'y = 3x', 'y = 0,5x'],
    rigtigIndex: 2,
    forklaring: 'Tip: jo større tal foran x, jo stejlere.',
  },
];
