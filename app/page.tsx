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
import {
  DISCIPLINER,
  KATEGORI_NAVNE,
  type Kategori,
  type DisciplinId,
} from '@/lib/disciplines';
import { useStore, type DisciplinProgress } from '@/lib/store';
import { useHydrated } from '@/lib/use-hydrated';
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
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12 lg:py-16">
        {/* HEADER */}
        <header className="mb-12 lg:mb-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                FP9 Matematik · Træn til prøven
              </p>
              <div className="flex items-baseline gap-2">
                <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                  Hej,
                </h1>
                <NameInput />
              </div>
              <p className="mt-3 text-base text-slate-600 italic font-serif">
                Vælg en disciplin, øv metoden, og tag prøveklar når du er klar.
              </p>
            </div>
            <SaveActions />
          </div>

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
        <div className="space-y-12 lg:space-y-16">
          {(Object.keys(grupperet) as Kategori[]).map((kategori) => (
            <section key={kategori}>
              <h2 className="font-display mb-5 text-sm font-bold uppercase tracking-[0.18em] text-slate-700 lg:mb-7">
                {KATEGORI_NAVNE[kategori]}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
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
