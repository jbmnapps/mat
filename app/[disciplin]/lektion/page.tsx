'use client';

/**
 * Lektion-mode for en disciplin.
 *
 * Filosofi: én ting på skærmen ad gangen. Eleven trykker Enter for at avancere
 * gennem dialogen. Aktive opgaver kræver at eleven taster svar.
 *
 * Hver disciplin har sin egen interaktive lektion som er fuldt self-contained
 * (egen header, egen scene, egen afslutning). Page'en her er bare en switcher.
 */

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { DISCIPLINER, getDisciplin, type DisciplinId } from '@/lib/disciplines';
import { AdditionInteractive } from '@/components/lektion/addition-interactive';

const interaktiveLektioner: Partial<
  Record<DisciplinId, React.ComponentType<{ disciplinId: DisciplinId }>>
> = {
  addition: AdditionInteractive,
};

export default function LektionPage() {
  const params = useParams<{ disciplin: string }>();
  const id = params.disciplin as DisciplinId;
  const valid = DISCIPLINER.some((d) => d.id === id);
  if (!valid) notFound();

  const Lektion = interaktiveLektioner[id];

  if (Lektion) {
    return <Lektion disciplinId={id} />;
  }

  // Fallback: kommer-snart for ikke-byggede disciplinerne
  const disciplin = getDisciplin(id);
  return (
    <main className="min-h-screen bg-slate-50/40">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-12 lg:py-14">
        <Link
          href={`/${id}/`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Tilbage til {disciplin.navn.toLowerCase()}
        </Link>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-5" aria-hidden />
          <p className="font-display text-2xl font-bold text-slate-900 mb-2">
            Lektion kommer snart
          </p>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            Vi bygger lektion-indhold for {disciplin.navn} så snart vi kan. Indtil da kan du
            gå videre med en anden disciplin.
          </p>
        </div>
      </div>
    </main>
  );
}
