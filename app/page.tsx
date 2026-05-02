'use client';

/**
 * Dashboard — startsiden.
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────┐
 *  │  EYEBROW (FP9 Matematik · Træn til prøven)       │
 *  │  Hej, [navn]                  [importér][eksportér]│
 *  │  italic subtitle                                  │
 *  ├──────────────────────────────────────────────────┤
 *  │  TAL OG ALGEBRA                                   │
 *  │  [+] [−] [·] [:] [,] [%] [=] [?] [≈] [kr]        │
 *  │                                                   │
 *  │  GEOMETRI OG MÅLING                               │
 *  │  [cm] [°] [·] [V] [~]                            │
 *  │                                                   │
 *  │  STATISTIK OG SANDSYNLIGHED                       │
 *  │  [▮] [⊞] [P]                                     │
 *  └──────────────────────────────────────────────────┘
 */

import { motion } from 'motion/react';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import {
  DISCIPLINER,
  DISCIPLIN_FARVE,
  KATEGORI_NAVNE,
  TRÆNINGS_TRIN,
  getDisciplin,
  type Kategori,
  type DisciplinId,
} from '@/lib/disciplines';
import { useStore, type DisciplinProgress } from '@/lib/store';
import { useHydrated } from '@/lib/use-hydrated';
import { AuthGate } from '@/lib/auth';
import { harIndhold } from '@/lib/content-registry';
import { cn } from '@/lib/utils';
import { DisciplineCard } from '@/components/discipline-card';
import { SaveActions, NameInput } from '@/components/save-actions';

const tomDisciplinProgress: DisciplinProgress = {
  status: 'untouched',
  bedsteScore: 0,
  antalForsoeg: 0,
  sidsteForsoeg: null,
  historik: [],
};

export default function Dashboard() {
  return (
    <AuthGate>
      <DashboardIndhold />
    </AuthGate>
  );
}

function DashboardIndhold() {
  const hydreret = useHydrated();
  const progress = useStore((s) => s.progress);

  // Grupper diciplinerne efter kategori
  const grupperet = useMemo(() => {
    const grupper: Record<Kategori, typeof DISCIPLINER> = {
      'tal-og-algebra': [],
      geometri: [],
      statistik: [],
    };
    for (const d of DISCIPLINER) {
      grupper[d.kategori].push(d);
    }
    return grupper;
  }, []);

  // Aggregér samlet status til en lille sammenfatning øverst
  const oversigt = useMemo(() => {
    if (!hydreret) return null;
    let gron = 0;
    let gul = 0;
    let rod = 0;
    let utouchet = 0;
    for (const id of Object.keys(progress) as DisciplinId[]) {
      switch (progress[id].status) {
        case 'gron':
          gron++;
          break;
        case 'gul':
          gul++;
          break;
        case 'rod':
          rod++;
          break;
        default:
          utouchet++;
      }
    }
    return { gron, gul, rod, utouchet };
  }, [progress, hydreret]);

  return (
    <main className="min-h-screen bg-slate-50/40">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12 lg:px-12 lg:py-16">
        {/* HEADER */}
        <header className="relative mb-6 sm:mb-12 lg:mb-16">
          {/* Save-actions øverst til højre, alle skærme */}
          <div className="absolute right-0 top-0">
            <SaveActions />
          </div>
          <div className="pr-20">
            <p className="mb-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:mb-3">
              FP9 Matematik · Træn til prøven
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                Hej,
              </h1>
              <NameInput />
            </div>
          </div>

          {/* Næste op-card — anbefalet sekvens baseret på FP9-vægtning */}
          {hydreret && <NæsteOpCard progress={progress} />}

          {/* Oversigts-pille — vises kun når hydreret og noget er prøvet */}
          {hydreret && oversigt && (oversigt.gron + oversigt.gul + oversigt.rod) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-8 inline-flex flex-wrap items-center gap-4 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm shadow-sm"
            >
              <span className="font-semibold text-slate-700">Din status:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-gron" aria-hidden />
                <span className="text-slate-700">
                  <strong>{oversigt.gron}</strong> grøn
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-gul" aria-hidden />
                <span className="text-slate-700">
                  <strong>{oversigt.gul}</strong> gul
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-rod" aria-hidden />
                <span className="text-slate-700">
                  <strong>{oversigt.rod}</strong> rød
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                <span>
                  <strong>{oversigt.utouchet}</strong> ikke startet
                </span>
              </span>
            </motion.div>
          )}
        </header>

        {/* DISCIPLIN-GRUPPER */}
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {(Object.keys(grupperet) as Kategori[]).map((kategori) => (
            <section key={kategori}>
              <h2 className="font-display mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 sm:mb-5 sm:text-sm lg:mb-7">
                {KATEGORI_NAVNE[kategori]}
              </h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
                {grupperet[kategori].map((disciplin, i) => (
                  <DisciplineCard
                    key={disciplin.id}
                    disciplin={disciplin}
                    progress={hydreret ? progress[disciplin.id] : tomDisciplinProgress}
                    index={i}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="mt-20 border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
          FP9 Matematik · Træn til prøven uden hjælpemidler
        </footer>
      </div>
    </main>
  );
}

// ─────── Næste op-card ───────
//
// Anbefalet næste disciplin baseret på den prioriterede sekvens i
// TRÆNINGS_TRIN. Vi går igennem trinnene i rækkefølge og finder den
// første disciplin der ikke er grøn endnu (og som har bygget træning).

interface NæsteForslag {
  id: DisciplinId;
  trinIndex: number;
  trinTitel: string;
  begrundelse: string;
}

function findNæsteAnbefalede(
  progress: Record<DisciplinId, DisciplinProgress>,
): NæsteForslag | null {
  for (let i = 0; i < TRÆNINGS_TRIN.length; i++) {
    const trin = TRÆNINGS_TRIN[i];
    for (const id of trin.disciplinerne) {
      if (!harIndhold(id, 'traening')) continue;
      if (progress[id]?.status === 'gron') continue;
      return {
        id,
        trinIndex: i,
        trinTitel: trin.titel,
        begrundelse: trin.begrundelse,
      };
    }
  }
  return null;
}

function NæsteOpCard({
  progress,
}: {
  progress: Record<DisciplinId, DisciplinProgress>;
}) {
  const næste = findNæsteAnbefalede(progress);

  if (!næste) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-6 sm:mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5 sm:px-7 sm:py-6"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-200 text-emerald-700"
            aria-hidden
          >
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Du er klar
            </p>
            <h2 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-emerald-950">
              Alle disciplinerne er grønne
            </h2>
            <p className="mt-0.5 text-sm text-emerald-800/80 italic font-serif">
              Genoptag dem du føler dig usikker i for at holde formen.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const disciplin = getDisciplin(næste.id);
  const farve = DISCIPLIN_FARVE[næste.id];
  const totalTrin = TRÆNINGS_TRIN.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="mt-6 sm:mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:px-7 sm:py-6 shadow-sm"
    >
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3 sm:mb-4">
        Træningsplan · Trin {næste.trinIndex + 1} af {totalTrin} · {næste.trinTitel}
      </p>
      <div className="flex items-center gap-4 sm:gap-5">
        <span
          className={cn(
            'flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl font-display text-2xl sm:text-4xl font-bold',
            farve.bg,
            farve.tekst,
          )}
          aria-hidden
        >
          {disciplin.symbol}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-0.5">
            Næste op
          </p>
          <h2 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            {disciplin.navn}
          </h2>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 italic font-serif leading-snug">
            {næste.begrundelse}
          </p>
        </div>
        <Link
          href={`/${næste.id}/traening/`}
          className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 hover:shadow-md transition-all"
        >
          Start
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <Link
        href={`/${næste.id}/traening/`}
        className="sm:hidden mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Start træning
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </motion.div>
  );
}
