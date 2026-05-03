'use client';

/**
 * Disciplin-side — viser tre mode-kort: Lektion, Træning, Prøveklar.
 *
 * Viser også elev-progress (status, bedste score) hvis relevant.
 * Statisk pre-rendret (én side pr. disciplin) via generateStaticParams i layout.
 */

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { DISCIPLINER, DISCIPLIN_FARVE, getDisciplin, type DisciplinId } from '@/lib/disciplines';
import { useStore } from '@/lib/store';
import { useHydrated } from '@/lib/use-hydrated';
import { harIndhold } from '@/lib/content-registry';
import { ModeCard } from '@/components/mode-card';
import { cn } from '@/lib/utils';

export default function DisciplinPage() {
  const params = useParams<{ disciplin: string }>();
  const id = params.disciplin as DisciplinId;
  const valid = DISCIPLINER.some((d) => d.id === id);
  if (!valid) notFound();

  const disciplin = getDisciplin(id);
  const farve = DISCIPLIN_FARVE[id];

  const hydreret = useHydrated();
  const progress = useStore((s) => s.progress[id]);

  return (
    <main className="min-h-[100dvh] flex flex-col bg-slate-50/40">
      <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col px-4 py-4 sm:px-6 sm:py-10 lg:px-12 lg:py-14">
        {/* Tilbage-link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-4 sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Tilbage til oversigten
        </Link>

        {/* Disciplin-header */}
        <motion.header
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <p className="hidden sm:block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
            Disciplin
          </p>
          <div className="flex items-center gap-3 sm:gap-5">
            <div
              className={cn(
                'flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl font-display text-2xl sm:text-4xl font-bold shrink-0',
                farve.bg,
                farve.tekst,
              )}
              aria-hidden
            >
              {disciplin.symbol}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl leading-tight">
                {disciplin.navn}
              </h1>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-slate-600 italic font-serif leading-snug">
                {disciplin.beskrivelse}
              </p>
            </div>
          </div>
        </motion.header>

        {/* Mode-kort — centreret vertikalt i den ledige plads. På korte
            viewports (mobil med kort indhold) sidder kortene midt på
            skærmen i stedet for at klumpe sig under headeren. */}
        <div className="flex-1 flex flex-col justify-center py-8 sm:py-12">
          <div className="flex flex-col gap-3 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ModeCard
              mode="lektion"
              disciplinId={id}
              kommerSnart={!harIndhold(id, 'lektion')}
              index={0}
            />
            <ModeCard
              mode="traening"
              disciplinId={id}
              kommerSnart={!harIndhold(id, 'traening')}
              index={1}
            />
            <ModeCard
              mode="proeveklar"
              disciplinId={id}
              bedsteScore={hydreret ? progress.bedsteScore : 0}
              status={hydreret ? progress.status : 'untouched'}
              kommerSnart={!harIndhold(id, 'proeveklar')}
              index={2}
            />
          </div>
        </div>

        {/* Progress-snapshot hvis prøvet */}
        {hydreret && progress.antalForsoeg > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600"
          >
            Du har taget prøveklar <strong className="text-slate-900">{progress.antalForsoeg}</strong>{' '}
            {progress.antalForsoeg === 1 ? 'gang' : 'gange'}. Bedste resultat:{' '}
            <strong className="text-slate-900">{progress.bedsteScore}%</strong>.
          </motion.div>
        )}
      </div>
    </main>
  );
}
