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
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: STORE_VERSION,
      // Ved fremtidige schema-ændringer:
      // migrate: (persistedState, version) => { ... }

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
