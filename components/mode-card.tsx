'use client';

/**
 * Mode-kort til disciplin-side.
 *
 * Hver disciplin har tre tilstande: Lektion, Træning, Prøveklar.
 * Kortet viser titel, beskrivelse, ikon og — for prøveklar — current bedste-score.
 */

import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, Dumbbell, Target, ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DisciplinId, Status } from '@/lib/disciplines';

export type Mode = 'lektion' | 'traening' | 'proeveklar';

interface ModeMeta {
  titel: string;
  undertitel: string;
  ikon: LucideIcon;
  /** Tailwind-klasser for ikon-baggrund og -tekst */
  iconBg: string;
  iconText: string;
}

const MODES: Record<Mode, ModeMeta> = {
  lektion: {
    titel: 'Lektion',
    undertitel: 'Lær metoden trin for trin',
    ikon: BookOpen,
    iconBg: 'bg-slate-900',
    iconText: 'text-white',
  },
  traening: {
    titel: 'Træning',
    undertitel: 'Øv så det sidder fast',
    ikon: Dumbbell,
    iconBg: 'bg-amber-500',
    iconText: 'text-white',
  },
  proeveklar: {
    titel: 'Prøveklar',
    undertitel: 'Test din viden — afgør status',
    ikon: Target,
    iconBg: 'bg-emerald-600',
    iconText: 'text-white',
  },
};

const statusFarver: Record<Status, { dot: string; tekst: string; label: string }> = {
  untouched: { dot: 'bg-slate-300', tekst: 'text-slate-400', label: 'Ikke startet' },
  rod: { dot: 'bg-status-rod', tekst: 'text-status-rod', label: 'Rød' },
  gul: { dot: 'bg-status-gul', tekst: 'text-status-gul', label: 'Gul' },
  gron: { dot: 'bg-status-gron', tekst: 'text-status-gron', label: 'Grøn' },
};

interface Props {
  mode: Mode;
  disciplinId: DisciplinId;
  /** For prøveklar: vis nuværende bedste resultat */
  bedsteScore?: number;
  status?: Status;
  /** Vis en "kommer snart"-badge hvis indholdet ikke er bygget endnu */
  kommerSnart?: boolean;
  index?: number;
}

export function ModeCard({
  mode,
  disciplinId,
  bedsteScore,
  status,
  kommerSnart = false,
  index = 0,
}: Props) {
  const meta = MODES[mode];
  const Ikon = meta.ikon;
  const showStatus = mode === 'proeveklar' && status !== undefined;
  const statusInfo = showStatus ? statusFarver[status] : null;
  const harForsoegt = bedsteScore !== undefined && status !== 'untouched';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Link
        href={`/${disciplinId}/${mode}/`}
        className={cn(
          'group relative flex rounded-2xl border bg-white',
          // Mobil: kompakt liste-stil (ikon venstre, tekst til højre, arrow til højre)
          'items-center gap-4 p-4',
          // Desktop: kort-stil (ikon top, tekst under, arrow bund)
          'sm:flex-col sm:items-stretch sm:gap-0 sm:p-6 sm:h-full',
          'transition-all duration-200 ease-out',
          'hover:-translate-y-0.5 hover:shadow-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          'border-slate-200 hover:border-slate-300',
        )}
      >
        {/* Ikon */}
        <div
          className={cn(
            'flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110',
            'sm:mb-5',
            meta.iconBg,
            meta.iconText,
          )}
        >
          <Ikon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} aria-hidden />
        </div>

        {/* Titel + undertitel */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 sm:block">
            <h3 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-slate-900 sm:mb-1">
              {meta.titel}
            </h3>
            {kommerSnart && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                Kommer snart
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-snug mt-0.5 sm:mt-0">
            {meta.undertitel}
          </p>
        </div>

        {/* Bund: Status (kun prøveklar) eller arrow */}
        <div className="flex items-center justify-between sm:mt-6 shrink-0 sm:shrink">
          {showStatus && statusInfo ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', statusInfo.dot)} aria-hidden />
              <span className={cn('text-xs font-semibold', statusInfo.tekst)}>
                {harForsoegt ? `Bedste ${bedsteScore}%` : statusInfo.label}
              </span>
            </div>
          ) : (
            <span className="hidden sm:inline" />
          )}
          {/* Mobil: vis bare bedste-score som lille tal hvis prøvet */}
          {showStatus && harForsoegt && (
            <span className={cn('sm:hidden text-xs font-semibold', statusInfo?.tekst)}>
              {bedsteScore}%
            </span>
          )}
          <ArrowRight
            className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700 ml-2 sm:ml-0"
            aria-hidden
          />
        </div>
      </Link>
    </motion.div>
  );
}
