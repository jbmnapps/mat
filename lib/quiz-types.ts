/**
 * Typer for quiz-opgaver — bruges af både Træning og Prøveklar.
 *
 * To grundtyper:
 *  - 'numeric'        : eleven indtaster et tal (decimal eller heltal). Accepter komma og punktum.
 *  - 'multiple-choice': eleven vælger 1 af N svarmuligheder.
 *
 * En opgave kan have en valgfri kort `forklaring` der vises efter svaret er givet.
 */

export interface NumericOpgave {
  id: string;
  type: 'numeric';
  /** Opgavens spørgsmålstekst — kan indeholde regnestykke, ordrig opgave, etc. */
  spørgsmål: string;
  /** Det rigtige svar. Decimal accepteres med både komma og punktum i input. */
  svar: number;
  /** Valgfri tolerance for flydende svar (fx 0.01). Default 0 = præcis match. */
  tolerance?: number;
  /** Valgfri enhed der vises efter input-feltet (fx "kr", "cm", "%"). */
  enhed?: string;
  /** Kort forklaring vist efter svar (én sætning, FP9-tone). */
  forklaring?: string;
}

export interface MultipleChoiceOpgave {
  id: string;
  type: 'multiple-choice';
  spørgsmål: string;
  muligheder: string[];
  /** 0-baseret index i `muligheder` for det rigtige svar. */
  rigtigIndex: number;
  forklaring?: string;
}

export type Opgave = NumericOpgave | MultipleChoiceOpgave;

/**
 * Parse et tal-input fra eleven. Accepter komma og punktum som decimal-tegn.
 * Returnerer NaN hvis ikke et gyldigt tal.
 */
export function parseTalInput(input: string): number {
  const renset = input.trim().replace(',', '.');
  if (renset === '') return NaN;
  return Number(renset);
}

/**
 * Tjek om elevens svar er rigtigt. Tolerance giver lidt slæk for decimaltal.
 */
export function svarErRigtigt(opgave: Opgave, elevSvar: string | number): boolean {
  if (opgave.type === 'numeric') {
    const num = typeof elevSvar === 'number' ? elevSvar : parseTalInput(elevSvar);
    if (Number.isNaN(num)) return false;
    const tol = opgave.tolerance ?? 0;
    return Math.abs(num - opgave.svar) <= tol;
  }
  // multiple-choice — elevSvar er index'et som string eller number
  const idx = typeof elevSvar === 'number' ? elevSvar : parseInt(String(elevSvar), 10);
  return idx === opgave.rigtigIndex;
}
