/**
 * Zustand-store med localStorage-persistens.
 *
 * Holder progress pr. disciplin: status, bedste score, antal forsøg, historik.
 * Status afgøres af bedste prøveklar-score, ikke seneste — eleven kan retage
 * uendeligt og status forbedres når de gør det bedre.
 *
 * SSR-noter:
 *  - Zustand persist hydrerer på klient-siden efter mount
 *  - Brug useHydrated() i komponenter der viser progress-afhængig UI for
 *    at undgå hydration-mismatch
 *
 * Sync-lag (tilføjet i Supabase-bølgen):
 *  - `signedInId` / `signedInNavn` afspejler aktuel Supabase-auth-bruger.
 *    Sættes via lib/auth.ts. Når null = offline-only mode.
 *  - En subscription nederst i filen detekterer ændringer i `progress` og
 *    pusher den ændrede disciplin til Supabase fire-and-forget.
 *  - localStorage er stadig PRIMÆR. Hvis push fejler, sker der intet —
 *    næste gang sync trigges, prøver vi igen.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  DISCIPLINER,
  type DisciplinId,
  type Status,
  statusFraScore,
} from './disciplines';

/** Schema-versionen — øges når vi ændrer state-formen. Migrate-funktionen håndterer opgraderinger. */
export const STORE_VERSION = 1;
export const STORAGE_KEY = 'matematik-fp9-v1';

/** Et enkelt prøveklar-forsøg. */
export interface Forsoeg {
  score: number;
  timestamp: string;
}

/** Progress for én disciplin. */
export interface DisciplinProgress {
  status: Status;
  bedsteScore: number;
  antalForsoeg: number;
  sidsteForsoeg: string | null;
  historik: Forsoeg[];
}

/** Hele app-state. */
export interface AppState {
  /** Valgfri elevnavn — bruges kun i save-fil-export. */
  elevNavn: string | null;
  /** Progress pr. disciplin. */
  progress: Record<DisciplinId, DisciplinProgress>;

  /** Supabase auth.uid() — sættes når eleven er logget ind. null = offline-only. */
  signedInId: string | null;
  /** Visningsnavn for indlogget elev. */
  signedInNavn: string | null;

  // Actions
  registrérPrøveklarForsoeg: (disciplin: DisciplinId, score: number) => void;
  sætElevNavn: (navn: string | null) => void;
  /** Erstat hele state (fx fra save-fil-import). */
  erstatProgress: (
    progress: Record<DisciplinId, DisciplinProgress>,
    elevNavn: string | null,
  ) => void;
  /** Nulstil én disciplin. */
  nulstilDisciplin: (disciplin: DisciplinId) => void;
  /** Nulstil alt. */
  nulstilAlt: () => void;
  /** Sæt eller ryd login-status (kaldes fra lib/auth.ts). */
  setSignedIn: (id: string | null, navn: string | null) => void;
}

/** Default-progress for én disciplin (eleven har ikke rørt den endnu). */
const tomDisciplinProgress = (): DisciplinProgress => ({
  status: 'untouched',
  bedsteScore: 0,
  antalForsoeg: 0,
  sidsteForsoeg: null,
  historik: [],
});

/** Initial progress for alle diciplinerne. */
const initialProgress = (): Record<DisciplinId, DisciplinProgress> => {
  const obj = {} as Record<DisciplinId, DisciplinProgress>;
  for (const d of DISCIPLINER) {
    obj[d.id] = tomDisciplinProgress();
  }
  return obj;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      elevNavn: null,
      progress: initialProgress(),
      signedInId: null,
      signedInNavn: null,

      registrérPrøveklarForsoeg: (disciplinId, score) => {
        const tidspunkt = new Date().toISOString();
        set((state) => {
          const aktuel = state.progress[disciplinId];
          const erNyBedste = score > aktuel.bedsteScore;
          const nyBedste = erNyBedste ? score : aktuel.bedsteScore;

          return {
            progress: {
              ...state.progress,
              [disciplinId]: {
                status: statusFraScore(nyBedste),
                bedsteScore: nyBedste,
                antalForsoeg: aktuel.antalForsoeg + 1,
                sidsteForsoeg: tidspunkt,
                historik: [...aktuel.historik, { score, timestamp: tidspunkt }],
              },
            },
          };
        });
      },

      sætElevNavn: (navn) => set({ elevNavn: navn }),

      erstatProgress: (progress, elevNavn) => set({ progress, elevNavn }),

      nulstilDisciplin: (disciplinId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [disciplinId]: tomDisciplinProgress(),
          },
        })),

      nulstilAlt: () =>
        set({
          elevNavn: null,
          progress: initialProgress(),
        }),

      setSignedIn: (id, navn) => set({ signedInId: id, signedInNavn: navn }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: STORE_VERSION,
      // Ved fremtidige schema-ændringer:
      // migrate: (persistedState, version) => { ... }

      // Persister auth-state så første render kan vise dashboardet uden
      // at vente på en Supabase-session-tjek. Supabase har sin egen
      // session-storage (storageKey: 'fp9-auth') som er truth — vi cacher
      // bare brugeren's id+navn her for snappier UX.
      // Hvis vores cache er ude af sync med Supabase, opdaterer
      // useAuth-hooket den i baggrunden.
      partialize: (state) => ({
        elevNavn: state.elevNavn,
        progress: state.progress,
        signedInId: state.signedInId,
        signedInNavn: state.signedInNavn,
      }),

      // Sørg for at nye diciplinerne (tilføjet senere) får default-progress
      // selv hvis localStorage er fra en gammel version
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState>;
        const fletProgress = { ...currentState.progress };
        if (persisted.progress) {
          for (const id of Object.keys(persisted.progress) as DisciplinId[]) {
            if (id in fletProgress) {
              fletProgress[id] = persisted.progress[id];
            }
          }
        }
        return {
          ...currentState,
          ...persisted,
          progress: fletProgress,
        };
      },
    },
  ),
);

// ────────────────────────────────────────────────────────────────────────────
// Sync-subscription: når progress ændres OG eleven er logget ind, push den
// ændrede disciplin til Supabase. Fire-and-forget — localStorage er stadig
// primær kilde, så push-fejl er ikke kritisk.
//
// Lazy import af lib/auth for at undgå circular dep (auth → store → auth).
// Subscription installeres kun i browseren, ikke under SSR/static export.
// ────────────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  let forrigeProgress = useStore.getState().progress;
  useStore.subscribe((state) => {
    if (!state.signedInId) {
      forrigeProgress = state.progress;
      return;
    }
    if (state.progress === forrigeProgress) return;

    // Find ændrede disciplinerne
    const ændrede: DisciplinId[] = [];
    for (const id of Object.keys(state.progress) as DisciplinId[]) {
      if (state.progress[id] !== forrigeProgress[id]) {
        ændrede.push(id);
      }
    }
    forrigeProgress = state.progress;

    if (ændrede.length === 0) return;

    const brugerId = state.signedInId;
    import('./auth')
      .then(({ pushDisciplin }) => {
        for (const id of ændrede) {
          pushDisciplin(brugerId, id, state.progress[id]).catch(() => {
            /* offline OK */
          });
        }
      })
      .catch((e) => {
        console.error('[store] kunne ikke loade auth-modul:', e);
      });
  });
}
