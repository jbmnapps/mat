/**
 * Registry over hvilket indhold der er bygget pr. disciplin og mode.
 * Bruges til at vise "kommer snart"-badges på disciplin-siden.
 *
 * Som vi bygger flere ark, opdaterer vi denne fil — én linje pr. nyt indhold.
 */

import type { DisciplinId } from './disciplines';
import type { Mode } from '@/components/mode-card';

/** Map: disciplin → modes der har indhold bygget. */
const INDHOLD: Partial<Record<DisciplinId, Mode[]>> = {
  addition: ['lektion', 'traening'], // lektion + træning; prøveklar kommer
  subtraktion: ['traening'],
  multiplikation: ['traening'],
  division: ['traening'],
  procent: ['traening'],
  ligninger: ['traening'],
};

export function harIndhold(disciplin: DisciplinId, mode: Mode): boolean {
  return INDHOLD[disciplin]?.includes(mode) ?? false;
}
