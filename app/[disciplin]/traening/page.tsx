'use client';

/**
 * Træning-mode for en disciplin.
 *
 * Bruger den generiske <Quiz /> med opgaver hentet fra opgave-registry.
 * Hvis der ikke er opgaver bygget endnu, vises en "kommer snart"-fallback.
 */

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { DISCIPLINER, getDisciplin, type DisciplinId } from '@/lib/disciplines';
import { hentOpgaver, harOpgaver } from '@/lib/opgaver';
import { Quiz } from '@/components/quiz';

export default function TraeningPage() {
  const params = useParams<{ disciplin: string }>();
  const id = params.disciplin as DisciplinId;
  const valid = DISCIPLINER.some((d) => d.id === id);
  if (!valid) notFound();

  const disciplin = getDisciplin(id);

  if (!harOpgaver(id)) {
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
            <Dumbbell className="h-10 w-10 text-slate-400 mx-auto mb-5" aria-hidden />
            <p className="font-display text-2xl font-bold text-slate-900 mb-2">
              Træning kommer snart
            </p>
            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
              Vi bygger træningsopgaver for {disciplin.navn} lige nu. Vend tilbage om lidt.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <Quiz
      disciplinId={id}
      disciplinNavn={disciplin.navn}
      opgaver={hentOpgaver(id)}
      mode="traening"
    />
  );
}
