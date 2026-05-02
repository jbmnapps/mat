/**
 * Layout for /[disciplin]/* — primært til at hoste generateStaticParams.
 * Pre-rendrer alle disciplin-stier ved build for static export.
 */

import { DISCIPLINER } from '@/lib/disciplines';

export async function generateStaticParams() {
  return DISCIPLINER.map((d) => ({ disciplin: d.id }));
}

export default function DisciplinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
