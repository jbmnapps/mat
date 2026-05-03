'use client';

/**
 * Disciplin-kort til dashboardet.
 *
 *  ┌──────────────────────────┐
 *  │                     58%  │  ← score-pille (kun hvis attempted)
 *  │                          │
 *  │           +              │  ← stort symbol (operation-farve)
 *  │       Addition           │  ← navn (Quicksand bold)
 *  │       ▰▰▰▱▱▱             │  ← progress-bar (kun hvis attempted)
 *  │                          │
 *  │  Ikke startet         →  │  ← bund-række (arrow + status)
 *  └──────────────────────────┘
 *
 *  Hover: subtil løft + skygge + symbol-skalering
 *  Click: route til /[disciplin]
 */

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DISCIPLIN_FARVE, type Disciplin, type Status } from '@/lib/disciplines';
import type { DisciplinProgress } from '@/lib/store';

interface Props {
  disciplin: Disciplin;
  progress: DisciplinProgress;
  /** Index brugt til stagger-animation ved første load */
  index?: number;
}

const statusFarver: Record<Status, { dot: string; tekst: string; ring: string }> = {
  untouched: {
    dot: 'bg-slate-300',
    tekst: 'text-slate-400',
    ring: 'ring-slate-200',
  },
  rod: {
    dot: 'bg-status-rod',
    tekst: 'text-status-rod',
    ring: 'ring-status-rod/30',
  },
  gul: {
    dot: 'bg-status-gul',
    tekst: 'text-status-gul',
    ring: 'ring-status-gul/30',
  },
  gron: {
    dot: 'bg-status-gron',
    tekst: 'text-status-gron',
    ring: 'ring-status-gron/40',
  },
};

export function DisciplineCard({ disciplin, progress, index = 0 }: Props) {
  const status = statusFarver[progress.status];
  const farve = DISCIPLIN_FARVE[disciplin.id];
  const harForsoegt = progress.antalForsoeg > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: 'easeOut' }}
    >
      <Link
        href={`/${disciplin.id}/`}
        className={cn(
          'group relative block h-full overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-5',
          'transition-all duration-200 ease-out',
          'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
          'active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
        )}
        aria-label={`${disciplin.navn} — ${progress.status === 'untouched' ? 'ikke startet' : `bedste resultat ${progress.bedsteScore}%`}`}
      >
        {/* Score øverst til højre — kun hvis prøvet, farvet efter status */}
        {harForsoegt && (
          <span
            className={cn(
              'absolute right-2 top-2 sm:right-3 sm:top-3 text-[10px] sm:text-xs font-bold tabular-nums',
              status.tekst,
            )}
          >
            {progress.bedsteScore}%
          </span>
        )}

        {/* Stort symbol */}
        <div className="flex justify-center pt-1 pb-2 sm:pt-3 sm:pb-4">
          <span
            className={cn(
              'flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl text-2xl sm:text-4xl font-bold transition-transform duration-200 ease-out',
              'font-display tracking-tight',
              'group-hover:scale-105',
              farve.bg,
              farve.tekst,
            )}
            aria-hidden
          >
            {disciplin.symbol}
          </span>
        </div>

        {/* Navn + progress-bar */}
        <div className="text-center">
          <h3 className="font-display text-[11px] sm:text-base font-bold text-slate-900 leading-tight break-words hyphens-auto">
            {disciplin.navn}
          </h3>
          {/* Progress-bar — visuelt match med %-pillen i toppen.
              Vises på alle skærme når eleven har forsøgt — slankere på mobil
              hvor kortene er små. */}
          {harForsoegt && (
            <div className="mx-auto mt-1.5 sm:mt-2 h-1 sm:h-1.5 w-10 sm:w-16 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn('h-full rounded-full transition-all', status.dot)}
                style={{ width: `${progress.bedsteScore}%` }}
                aria-hidden
              />
            </div>
          )}
        </div>

        {/* Bund-rækken på desktop — bevarer arrow + ikke-startet-tekst */}
        {!harForsoegt && (
          <div className="hidden sm:flex mt-4 items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-400 italic font-serif">Ikke startet</span>
            <ArrowRight
              className="h-3.5 w-3.5 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500"
              aria-hidden
            />
          </div>
        )}
        {harForsoegt && (
          <div className="hidden sm:flex mt-4 items-center justify-end border-t border-slate-100 pt-3 text-xs">
            <ArrowRight
              className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700"
              aria-hidden
            />
          </div>
        )}
      </Link>
    </motion.div>
  );
}
