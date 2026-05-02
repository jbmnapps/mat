/**
 * Eksport / import af progress som JSON-fil.
 *
 * Bruges når:
 *  - Eleven vil flytte progress mellem enheder
 *  - Læreren vil iterere appen uden at miste elev-data
 *  - Backup hvis browseren ryddes
 *
 * Format-version: 1
 *
 *   {
 *     version: 1,
 *     exportedAt: "2026-04-29T...",
 *     studentName: "Sara" | null,
 *     progress: { addition: { ... }, ... }
 *   }
 *
 * Når vi senere ændrer schema (version 2+), tilføj migration nedenfor.
 */

import { useStore } from './store';
import type { AppState, DisciplinProgress } from './store';
import type { DisciplinId } from './disciplines';

const FORMAT_VERSION = 1;

interface SaveFile {
  version: number;
  exportedAt: string;
  studentName: string | null;
  progress: Record<DisciplinId, DisciplinProgress>;
}

/**
 * Eksporter den nuværende state som en JSON-fil og trigger download.
 * Filnavn: fp9-status-YYYY-MM-DD.json (eller -elevnavn hvis sat)
 */
export function eksporterProgress(state: AppState): void {
  const payload: SaveFile = {
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    studentName: state.elevNavn,
    progress: state.progress,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const dato = new Date().toISOString().split('T')[0];
  const navnDel = state.elevNavn
    ? `-${state.elevNavn.toLowerCase().replace(/[^a-zæøå0-9]/gi, '')}`
    : '';
  const filnavn = `fp9-status${navnDel}-${dato}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filnavn;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportResultat {
  success: boolean;
  besked: string;
  /** Hvis success: hvor mange diciplinerne blev hentet */
  antalIndlaest?: number;
}

/**
 * Læs en save-fil og merge den ind i state.
 * Validerer schema og håndterer fremtidige version-migrations.
 */
export async function importerProgress(file: File): Promise<ImportResultat> {
  let tekst: string;
  try {
    tekst = await file.text();
  } catch {
    return { success: false, besked: 'Kunne ikke læse filen.' };
  }

  let data: unknown;
  try {
    data = JSON.parse(tekst);
  } catch {
    return {
      success: false,
      besked: 'Filen er ikke gyldig JSON.',
    };
  }

  if (!isSaveFile(data)) {
    return {
      success: false,
      besked: 'Filen har ikke det forventede format.',
    };
  }

  // Future-proofing: håndtér version-migrations her
  if (data.version > FORMAT_VERSION) {
    return {
      success: false,
      besked: `Filen er fra en nyere version (v${data.version}). Opdatér appen.`,
    };
  }

  // Version 1 (nuværende): direkte apply
  const antal = Object.keys(data.progress).length;
  useStore.getState().erstatProgress(data.progress, data.studentName);

  return {
    success: true,
    besked: `Status indlæst (${antal} diciplinerne).`,
    antalIndlaest: antal,
  };
}

/** Type-guard for save-fil. */
function isSaveFile(data: unknown): data is SaveFile {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.version === 'number' &&
    typeof d.exportedAt === 'string' &&
    (d.studentName === null || typeof d.studentName === 'string') &&
    typeof d.progress === 'object' &&
    d.progress !== null
  );
}
