/**
 * Registry over træningsopgaver pr. disciplin.
 * Bruges af /[disciplin]/traening/page.tsx til at slå opgaverne op.
 *
 * Som vi tilføjer flere opgavebanker, importerer vi dem her — én linje pr. disciplin.
 */

import type { DisciplinId } from '../disciplines';
import type { Opgave } from '../quiz-types';
import { additionOpgaver } from './addition';
import { subtraktionOpgaver } from './subtraktion';
import { multiplikationOpgaver } from './multiplikation';
import { divisionOpgaver } from './division';
import { procentOpgaver } from './procent';
import { ligningerOpgaver } from './ligninger';
import { hverdagsregningOpgaver } from './hverdagsregning';
import { enhedsomregningOpgaver } from './enhedsomregning';
import { rumfangOpgaver } from './rumfang';
import { koordinatsystemOpgaver } from './koordinatsystem';
import { tabellerOpgaver } from './tabeller';
import { diagrammerOpgaver } from './diagrammer';
import { sandsynlighedOpgaver } from './sandsynlighed';

export const OPGAVER: Partial<Record<DisciplinId, Opgave[]>> = {
  addition: additionOpgaver,
  subtraktion: subtraktionOpgaver,
  multiplikation: multiplikationOpgaver,
  division: divisionOpgaver,
  procent: procentOpgaver,
  ligninger: ligningerOpgaver,
  hverdagsregning: hverdagsregningOpgaver,
  enhedsomregning: enhedsomregningOpgaver,
  rumfang: rumfangOpgaver,
  koordinatsystem: koordinatsystemOpgaver,
  tabeller: tabellerOpgaver,
  diagrammer: diagrammerOpgaver,
  sandsynlighed: sandsynlighedOpgaver,
};

export function harOpgaver(id: DisciplinId): boolean {
  return (OPGAVER[id]?.length ?? 0) > 0;
}

export function hentOpgaver(id: DisciplinId): Opgave[] {
  return OPGAVER[id] ?? [];
}
