/**
 * Eksport / import af progress som JSON-fil.
 *
 * Bruges når:
 *  - Eleven vil flytte progress mellem enheder
 *  - Læreren vil iterere appen uden at miste elev-data
 *  - Backup hvis browseren ryddes
 *  - **Migration til login-version (bølge 6)**: eleven importerer sin
 *    eksisterende JSON-fil ind i den nye Supabase-baserede konto.
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
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ⚠️ MIGRATION-KOMPATIBILITET — LÆS FØR DU ÆNDRER NOGET HER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Elever har JSON-filer eksporteret med format v1. De skal kunne importere
 * dem i fremtidige versioner — særligt når login bygges. For at bevare
 * kompatibilitet:
 *
 *  1. ÆNDR IKKE `DisciplinId`-strenge i lib/disciplines.ts. JSON refererer
 *     dem direkte. Omdøbning = ødelagte gamle filer.
 *  2. ÆNDR IKKE shape af `DisciplinProgress` på en bagudinkompatibel måde.
 *     Tilføjelser med default-værdier OK. Fjernelser eller omdøbninger ej.
 *  3. ÆNDR IKKE `SaveFile`-shape uden at bumpe FORMAT_VERSION og tilføje
 *     migration. Se isSaveFile() og version-tjekket i importerProgress.
 *  4. NÅR LOGIN KOMMER: udvid importerProgress med "push to Supabase"-step
 *     EFTER `erstatProgress`. Erstat ikke flowet — udvid det.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
 * Eksporter den nuværende state som en JSON-fil.
 * Filnavn: fp9-status-YYYY-MM-DD.json (eller -elevnavn hvis sat)
 *
 * Strategi:
 *  - iOS (touch + ingen rigtig fil-download): brug Web Share API → delings-ark
 *  - Andre platforme: blob + <a download>, med delayed revoke for at undgå
 *    race med browserens download-initiering.
 */
export async function eksporterProgress(state: AppState): Promise<void> {
  const payload: SaveFile = {
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    studentName: state.elevNavn,
    progress: state.progress,
  };

  const json = JSON.stringify(payload, null, 2);
  const dato = new Date().toISOString().split('T')[0];
  const navnDel = state.elevNavn
    ? `-${state.elevNavn.toLowerCase().replace(/[^a-zæøå0-9]/gi, '')}`
    : '';
  const filnavn = `fp9-status${navnDel}-${dato}.json`;

  // iOS-specifik: Web Share API. Andre platforme får traditionel download
  // selv hvis Share API findes (giver bedre UX på desktop).
  const erIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (erIOS && typeof navigator !== 'undefined' && 'canShare' in navigator) {
    const file = new File([json], filnavn, { type: 'application/json' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filnavn });
        return;
      } catch (e) {
        // AbortError = bruger annullerede; ikke fald tilbage til download
        if ((e as Error).name === 'AbortError') return;
        // Andre fejl: fald igennem til download
      }
    }
  }

  // Standard: blob + <a download>. Delayed revoke så browseren når at
  // initiere download før blob'en frigives.
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filnavn;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay på 1 sek — sikrer at download er startet før blob'en frigives
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    besked: `Status indlæst (${antal} ${antal === 1 ? 'disciplin' : 'discipliner'}).`,
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
