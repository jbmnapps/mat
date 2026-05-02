/**
 * Layout for /[disciplin]/* — primært til at hoste generateStaticParams.
 * Pre-rendrer alle disciplin-stier ved build for static export.
 *
 * Også: gater alle disciplin-routes (/[disciplin], /lektion, /traening) bag
 * login via <AuthGate>. Hvis eleven ikke er logget ind, redirectes til
 * /login/ — så de ikke kan deeplinke direkte til en træning.
 */

import { DISCIPLINER } from '@/lib/disciplines';
import { AuthGate } from '@/lib/auth';

export async function generateStaticParams() {
  return DISCIPLINER.map((d) => ({ disciplin: d.id }));
}

export default function DisciplinLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
