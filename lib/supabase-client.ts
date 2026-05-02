/**
 * Supabase-singleton.
 *
 * Filosofi:
 *  - Hvis env-vars mangler (lokal dev uden .env.local) returnerer vi `null`
 *    og hele backend-laget bliver no-op. Eksisterende app fungerer som før.
 *  - localStorage er PRIMÆR kilde til progress. Supabase er en kopi.
 *    Når vi ikke kan nå Supabase, fortsætter alt — det er offline-first.
 *  - Vi bruger ALDRIG service_role-key. Kun publishable/anon. Sikkerhed
 *    sidder i RLS-policies på serveren (se supabase-schema.sql).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Email-domæner — bevidst ikke-eksisterende TLDs så de aldrig kan modtage
// rigtig mail. Supabase bruger dem kun internt som unik identifier.
export const ELEV_EMAIL_DOMAIN = 'elev.fp9.local';
export const LAERER_EMAIL = 'laerer@fp9.local';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Vi understøtter både det nye (publishable) og det gamle (anon) navn —
// brugerens repo bruger `PUBLISHABLE_KEY`, men det dækker begge.
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True hvis backend er konfigureret. False ⇒ alt kører lokalt. */
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

let client: SupabaseClient | null = null;

/**
 * Hent Supabase-klienten. Returnerer null hvis env-vars mangler.
 * Caller MÅ tjekke for null før den bruges.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (typeof window === 'undefined') {
    // SSR: undgå at oprette klient, da den prøver at læse localStorage.
    // Static export pre-render kalder dette én gang under build — vi
    // returnerer null så ingen sync sker server-side.
    return null;
  }
  if (!client) {
    client = createClient(SUPABASE_URL!, SUPABASE_KEY!, {
      auth: {
        // Persist auth-session i localStorage så elever forbliver logget ind
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'fp9-auth',
      },
    });
  }
  return client;
}

// ─────── Hjælpefunktioner til navn/kode → email/password ───────

/**
 * Slugify et navn til brug i email.
 * "Sara M." → "saram"
 * "Mads-Christian" → "madschristian"
 * "Jørgen" → "joergen"
 *
 * Idé: helt deterministisk, lowercase, kun a–z og 0–9.
 * Hvis to elever vælger samme navn (selv med forskellig casing eller
 * tegnsætning), vil de kollidere — det er forventet (BACKEND-TJEK.md siger
 * "navn skal være unikt i klassen").
 */
export function navnTilSlug(navn: string): string {
  return navn
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 32);
}

export function elevEmail(navn: string): string {
  const slug = navnTilSlug(navn);
  return `${slug}@${ELEV_EMAIL_DOMAIN}`;
}

/**
 * Eleven taster en 4-cifret kode. Supabase Auth kræver mindst 6 tegn,
 * så vi præfikser. Det er ren intern transformation — eleven ser kun
 * de fire cifre i UI'en.
 */
export function elevPassword(kode: string): string {
  return `fp9-${kode}`;
}

/**
 * Lærer-password udledes fra NEXT_PUBLIC_LAERER_TOKEN. Tokenen er allerede
 * 32 tilfældige tegn (genereret af brugeren), så vi præfikser bare for
 * at sikre 6+ tegn og at vi ikke ved et uheld bruger en tom streng.
 */
export function laererPassword(): string | null {
  const token = process.env.NEXT_PUBLIC_LAERER_TOKEN;
  if (!token) return null;
  return `lærer-${token}`;
}

/** Validerer at en kode er præcis 4 cifre. Bruges i login-formen. */
export function erGyldigKode(kode: string): boolean {
  return /^\d{4}$/.test(kode);
}

/** Validerer at et navn giver et brugbart slug (ikke tomt efter sanitering). */
export function erGyldigNavn(navn: string): boolean {
  const slug = navnTilSlug(navn);
  return slug.length >= 2 && slug.length <= 32;
}
