'use client';

/**
 * Disciplin-kort til dashboardet.
 *
 *  ┌──────────────────────────┐
 *  │  ●  ← status (top-right) │
 *  │                          │
 *  │           +              │  ← stort symbol (operation-farve)
 *  │       Addition           │  ← navn (Quicksand bold)
 *  │     Læg sammen på papir  │  ← beskrivelse (italic, lille)
 *  │                          │
 *  │  Bedste 88% →            │  ← score-pille (vises kun hvis attempted)
 *  └──────────────────────────┘
 *
 *  Hover: subtil løft + skygge + symbol-skalering
 *  Click: route til /[disciplin]
 */

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Disciplin, Status } from '@/lib/disciplines';
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

const operationFarver = {
  add: { tekst: 'text-add', bg: 'bg-add-bg' },
  sub: { tekst: 'text-sub', bg: 'bg-sub-bg' },
  mul: { tekst: 'text-mul', bg: 'bg-mul-bg' },
  div: { tekst: 'text-div', bg: 'bg-div-bg' },
} as const;

export function DisciplineCard({ disciplin, progress, index = 0 }: Props) {
  const status = statusFarver[progress.status];
  const operation = disciplin.farve ? operationFarver[disciplin.farve] : null;
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
          'group relative block h-full rounded-2xl border border-slate-200 bg-white p-5',
          'transition-all duration-200 ease-out',
          'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
          'active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
        )}
        aria-label={`${disciplin.navn} — ${progress.status === 'untouched' ? 'ikke startet' : `bedste resultat ${progress.bedsteScore}%`}`}
      >
        {/* Status-prik øverst til højre */}
        <span
          className={cn(
            'absolute right-4 top-4 inline-block h-2.5 w-2.5 rounded-full ring-4',
            status.dot,
            status.ring,
          )}
          aria-hidden
        />

        {/* Stort symbol */}
        <div className="flex justify-center pt-3 pb-4">
          <span
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl text-4xl font-bold transition-transform duration-200 ease-out',
              'font-display tracking-tight',
              'group-hover:scale-105',
              operation
                ? cn(operation.bg, operation.tekst)
                : 'bg-slate-50 text-slate-700',
            )}
            aria-hidden
          >
            {disciplin.symbol}
          </span>
        </div>

        {/* Navn + beskrivelse */}
        <div className="text-center">
          <h3 className="font-display text-base font-bold text-slate-900 leading-tight">
            {disciplin.navn}
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-snug">
            {disciplin.beskrivelse}
          </p>
        </div>

        {/* Status-strip i bunden */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          {harForsoegt ? (
            <>
              <span className={cn('font-semibold', status.tekst)}>
                Bedste {progress.bedsteScore}%
              </span>
              <ArrowRight
                className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700"
                aria-hidden
              />
            </>
          ) : (
            <>
              <span className="text-slate-400 italic font-serif">Ikke startet</span>
              <ArrowRight
                className="h-3.5 w-3.5 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500"
                aria-hidden
              />
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
