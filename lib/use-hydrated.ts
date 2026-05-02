/**
 * Hook der returnerer true når Zustand-storen har gen-hydreret fra localStorage.
 *
 * Brug i komponenter der viser progress-afhængig UI for at undgå hydration-mismatch
 * mellem server-rendret HTML (default-state) og klient (localStorage-state).
 *
 * Eksempel:
 *
 *   const hydreret = useHydrated();
 *   const status = useStore((s) => s.progress.addition.status);
 *
 *   if (!hydreret) return <SkeletonCard />;
 *   return <RealCard status={status} />;
 */

'use client';

import { useEffect, useState } from 'react';
import { useStore } from './store';

export function useHydrated(): boolean {
  const [hydreret, setHydreret] = useState(false);

  useEffect(() => {
    // Hvis allerede hydreret før komponenten mounted (fx route-skift)
    if (useStore.persist.hasHydrated()) {
      setHydreret(true);
      return;
    }
    // Ellers: subscribe til onFinishHydration-eventet
    const unsub = useStore.persist.onFinishHydration(() => setHydreret(true));
    return () => unsub();
  }, []);

  return hydreret;
}
