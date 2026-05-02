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

import { useMemo } from 'react';
import {
  DISCIPLINER,
  KATEGORI_NAVNE,
  type Kategori,
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

  // Grupper disciplinerne efter kategori
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
