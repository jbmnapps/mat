/**
 * Auth + sync mellem localStorage-store og Supabase.
 *
 * Layered model:
 *
 *   Eleven  ──→  localStorage (PRIMÆR — virker offline)
 *                    │
 *                    └──→  Supabase (KOPI — sync når der er net)
 *
 * Login-flow (`logIndEllerOpret`):
 *   1. Prøv at sign in med navn+kode.
 *   2. Hvis det fejler: prøv at sign up.
 *   3. Hvis sign up også fejler (navn taget): besked til brugeren.
 *   4. Når logget ind: pull progress fra Supabase, merge med localStorage
 *      (max best_score wins), erstat lokal state med det merged.
 *   5. Push den merged state op igen, så begge er ens.
 *
 * Sync-flow (når store opdateres):
 *   - Subscription i lib/store.ts kalder `pushDisciplinHvisLogIn` med den
 *     ændrede disciplin.
 *   - Vi upserter (insert eller update) den ene række i Supabase.
 *   - Fail = log + glem. Eleven mister ikke noget — localStorage er stadig
 *     primær kilde. Næste sync prøver igen.
 */

'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import {
  getSupabase,
  supabaseEnabled,
  elevEmail,
  elevPassword,
  laererPassword,
  navnTilSlug,
  LAERER_EMAIL,
} from './supabase-client';
import { useStore, type DisciplinProgress } from './store';
import {
  DISCIPLINER,
  type DisciplinId,
  statusFraScore,
} from './disciplines';

// ─────── Resultat-typer ───────

export type LogInResultat =
  | { ok: true; nyKonto: boolean; brugerId: string; visningsnavn: string }
  | { ok: false; fejl: string };

export type LaererResultat =
  | { ok: true }
  | { ok: false; fejl: string };

// ─────── Login-flow (elev) ───────

/**
 * Prøv først at logge ind med navn+kode. Hvis brugeren ikke findes,
 * opret automatisk en konto. Synkronisér derefter progress.
 *
 * Bevidst design: vi beder ikke om "Opret konto" vs "Log ind" — det er
 * ét felt. Pseudo-første-gang oplevelse for elever.
 */
export async function logIndEllerOpret(
  navn: string,
  kode: string,
): Promise<LogInResultat> {
  if (!supabaseEnabled) {
    return { ok: false, fejl: 'Login er ikke sat op endnu. Spørg din lærer.' };
  }
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, fejl: 'Login virker kun i browseren.' };
  }

  const email = elevEmail(navn);
  const password = elevPassword(kode);
  const visningsnavn = navn.trim();

  // 1. Prøv sign in
  const { data: ind, error: indFejl } =
    await supabase.auth.signInWithPassword({ email, password });

  let brugerId: string | null = null;
  let nyKonto = false;

  if (ind?.user) {
    brugerId = ind.user.id;
  } else {
    // 2. Sign in fejlede — antag at brugeren ikke findes endnu, prøv sign up
    const { data: op, error: opFejl } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Vi har slået "confirm email" fra i Supabase-projektet, men
        // sender en tom data-blok så vi ikke får ekstra felter.
        data: { display_name: visningsnavn },
      },
    });
    if (opFejl) {
      // Sign up fejler typisk hvis brugeren findes med en ANDEN kode.
      // Vi kan ikke skelne fra sign-in-fejlen, så vi giver én samlet besked.
      return {
        ok: false,
        fejl: tolkAuthFejl(indFejl?.message, opFejl.message),
      };
    }
    if (!op?.user) {
      return { ok: false, fejl: 'Kunne ikke oprette konto. Prøv igen.' };
    }
    brugerId = op.user.id;
    nyKonto = true;
  }

  // 3. Sørg for at students-rækken findes (upsert efter login og signup)
  const slug = navnTilSlug(navn);
  const { error: studFejl } = await supabase.from('students').upsert(
    {
      id: brugerId,
      name_slug: slug,
      display_name: visningsnavn,
      last_active: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (studFejl) {
    // Hvis upsert fejler pga unique-constraint på name_slug, betyder det at
    // der findes en anden bruger med samme slug. Det burde ikke ske hvis
    // sign in/up gik godt, men beskytter mod kanttilfælde.
    if (studFejl.code === '23505' /* unique_violation */) {
      await supabase.auth.signOut();
      return {
        ok: false,
        fejl: 'Det navn er allerede taget. Vælg et andet navn.',
      };
    }
    // Andre fejl: log ud så vi ikke står i en halv tilstand
    await supabase.auth.signOut();
    return {
      ok: false,
      fejl: 'Kunne ikke gemme din konto. Prøv igen om lidt.',
    };
  }

  // 4. Sync progress: pull → merge → push
  await syncEfterLogIn(brugerId, visningsnavn);

  return { ok: true, nyKonto, brugerId, visningsnavn };
}

/**
 * Lærer-login: udled password fra token og signin.
 * Hvis kontoen ikke findes endnu, opret den. (Kun den der har det rigtige
 * token kan nogensinde komme frem hertil.)
 */
export async function logIndSomLaerer(token: string): Promise<LaererResultat> {
  if (!supabaseEnabled) {
    return { ok: false, fejl: 'Login er ikke sat op endnu.' };
  }
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, fejl: 'Login virker kun i browseren.' };
  }

  const forventet = process.env.NEXT_PUBLIC_LAERER_TOKEN;
  if (!forventet || token !== forventet) {
    return { ok: false, fejl: 'Forkert link.' };
  }

  const password = laererPassword();
  if (!password) {
    return { ok: false, fejl: 'Lærer-token mangler i konfiguration.' };
  }

  const { error: indFejl } = await supabase.auth.signInWithPassword({
    email: LAERER_EMAIL,
    password,
  });

  if (indFejl) {
    // Prøv sign up — første gang lærer-siden besøges
    const { error: opFejl } = await supabase.auth.signUp({
      email: LAERER_EMAIL,
      password,
    });
    if (opFejl) {
      return {
        ok: false,
        fejl: 'Kunne ikke logge ind som lærer. Tjek at SQL-scriptet er kørt.',
      };
    }
  }

  return { ok: true };
}

export async function logUd(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
  // Ryd sign-in-flag i store så UI opdaterer
  useStore.getState().setSignedIn(null, null);
}

// ─────── Hooks ───────

export interface AuthStatus {
  loading: boolean;
  signedIn: boolean;
  brugerId: string | null;
  visningsnavn: string | null;
  erLaerer: boolean;
}

/**
 * Hook der eksponerer den aktuelle auth-tilstand.
 *
 * Snappy strategi: vi læser signedInId fra Zustand-store (som persisteres
 * i localStorage) og returnerer det med det samme — ingen "loading"-fase.
 * I baggrunden verificerer vi mod Supabase og opdaterer cachen hvis den
 * er ude af sync.
 *
 * Det betyder at brugere med en aktiv session ser dashboardet INSTANT
 * når siden åbnes; vi spørger ikke "er du logget ind?" hver gang.
 */
export function useAuth(): AuthStatus {
  const signedInId = useStore((s) => s.signedInId);
  const signedInNavn = useStore((s) => s.signedInNavn);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let aktiv = true;

    // Verificér mod Supabase i baggrunden — opdater cache hvis nødvendigt
    supabase.auth.getSession().then(({ data }) => {
      if (!aktiv) return;
      const session = data.session;
      if (session?.user) {
        const navn =
          (session.user.user_metadata?.display_name as string | undefined) ??
          null;
        useStore.getState().setSignedIn(session.user.id, navn);
        // Refresh progress fra serveren ved session-start (caching mellem
        // device-skift)
        if (session.user.email !== LAERER_EMAIL) {
          syncEfterLogIn(session.user.id, navn).catch(() => {
            /* offline OK */
          });
        }
      } else {
        // Cached state var forkert — ryd den
        useStore.getState().setSignedIn(null, null);
      }
    });

    // Lyt til skift
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!aktiv) return;
      if (session?.user) {
        const navn =
          (session.user.user_metadata?.display_name as string | undefined) ??
          null;
        useStore.getState().setSignedIn(session.user.id, navn);
      } else {
        useStore.getState().setSignedIn(null, null);
      }
    });

    return () => {
      aktiv = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Vi tjekker erLaerer ved at sammenligne email — men da vi ikke holder
  // emailen i store'n, må vi læse fra session. Det gør vi via getSession
  // i et lille effect, men for enkelhed: hvis brugerId findes og navn er
  // null, antager vi læreren (læreren har ikke display_name).
  // Bedre: tjek faktisk email.
  const [erLaerer, setErLaerer] = useState(false);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !signedInId) {
      setErLaerer(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setErLaerer(data.user?.email === LAERER_EMAIL);
    });
  }, [signedInId]);

  return {
    // Altid false — vi rendrer instant baseret på cachet state.
    // (Felt bevaret af bagudkompatibilitet med eksisterende callers.)
    loading: false,
    signedIn: Boolean(signedInId),
    brugerId: signedInId,
    visningsnavn: signedInNavn,
    erLaerer,
  };
}

// ─────── Sync — pull, merge, push ───────

interface DBProgressRække {
  student_id: string;
  discipline_id: string;
  status: 'untouched' | 'rod' | 'gul' | 'gron';
  best_score: number;
  attempts: number;
  last_attempt: string | null;
  history: { score: number; timestamp: string }[];
}

/**
 * Efter login: hent alle rækker fra serveren, merge med localStorage,
 * erstat lokal state, push den merged state tilbage så begge er ens.
 *
 * Merge-strategi: for hver disciplin, vinder højeste best_score. Ved tie:
 * tag den med flest forsøg. Status udledes deterministisk fra best_score
 * via statusFraScore() — så er den altid konsistent.
 */
async function syncEfterLogIn(
  brugerId: string,
  _visningsnavn: string | null,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', brugerId);

  if (error) {
    console.error('[auth] kunne ikke hente progress:', error);
    return;
  }

  const lokal = useStore.getState().progress;
  const fjern = data ?? [];
  const flettet: Record<DisciplinId, DisciplinProgress> = { ...lokal };

  for (const r of fjern as DBProgressRække[]) {
    const id = r.discipline_id as DisciplinId;
    if (!(id in lokal)) continue; // ukendt disciplin — ignorer
    const fjernP: DisciplinProgress = {
      status: r.status,
      bedsteScore: r.best_score,
      antalForsoeg: r.attempts,
      sidsteForsoeg: r.last_attempt,
      historik: r.history ?? [],
    };
    flettet[id] = mergeMaxScore(lokal[id], fjernP);
  }

  // Erstat lokal state med flettet (preserver elevNavn)
  const aktuelNavn = useStore.getState().elevNavn;
  useStore.getState().erstatProgress(flettet, aktuelNavn);

  // Push den flettede state op
  await pushAlleDiscipliner(brugerId, flettet);

  // Hent total_active_seconds fra serveren — vi cacher lokalt for at vise
  // "Du har trænet X" på dashboardet uden roundtrip
  const { data: studentRow } = await supabase
    .from('students')
    .select('total_active_seconds')
    .eq('id', brugerId)
    .single();
  if (studentRow) {
    useStore.getState().setTotalActiveSeconds(studentRow.total_active_seconds ?? 0);
  }
}

/** Sammenflet to DisciplinProgress-værdier: max best_score wins. */
function mergeMaxScore(
  a: DisciplinProgress,
  b: DisciplinProgress,
): DisciplinProgress {
  const bedsteScore = Math.max(a.bedsteScore, b.bedsteScore);
  const antalForsoeg = Math.max(a.antalForsoeg, b.antalForsoeg);
  const historikSamlet = [...a.historik, ...b.historik];
  // Dedupe historik på timestamp
  const seen = new Set<string>();
  const historik = historikSamlet.filter((h) => {
    if (seen.has(h.timestamp)) return false;
    seen.add(h.timestamp);
    return true;
  });
  // Tag seneste sidsteForsoeg
  const sidste = [a.sidsteForsoeg, b.sidsteForsoeg]
    .filter((x): x is string => Boolean(x))
    .sort()
    .pop() ?? null;
  return {
    status: statusFraScore(bedsteScore),
    bedsteScore,
    antalForsoeg,
    sidsteForsoeg: sidste,
    historik,
  };
}

async function pushAlleDiscipliner(
  brugerId: string,
  progress: Record<DisciplinId, DisciplinProgress>,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const rækker = (Object.keys(progress) as DisciplinId[])
    .filter((id) => DISCIPLINER.some((d) => d.id === id))
    .map((id) => ({
      student_id: brugerId,
      discipline_id: id,
      status: progress[id].status,
      best_score: progress[id].bedsteScore,
      attempts: progress[id].antalForsoeg,
      last_attempt: progress[id].sidsteForsoeg,
      history: progress[id].historik,
      updated_at: new Date().toISOString(),
    }));

  const { error } = await supabase
    .from('progress')
    .upsert(rækker, { onConflict: 'student_id,discipline_id' });

  if (error) {
    console.error('[auth] push (alle) fejlede:', error);
  }
}

/**
 * Push én disciplin. Kaldes fra store-subscription efter en quiz.
 * Fail-stille: localStorage er stadig primær.
 */
export async function pushDisciplin(
  brugerId: string,
  disciplinId: DisciplinId,
  data: DisciplinProgress,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('progress').upsert(
    {
      student_id: brugerId,
      discipline_id: disciplinId,
      status: data.status,
      best_score: data.bedsteScore,
      attempts: data.antalForsoeg,
      last_attempt: data.sidsteForsoeg,
      history: data.historik,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'student_id,discipline_id' },
  );
  if (error) {
    console.error('[auth] push (single) fejlede:', error);
  }
}

// ─────── Lærer-side: hent alle elever ───────

export interface ElevOversigt {
  brugerId: string;
  visningsnavn: string;
  navnSlug: string;
  oprettet: string;
  sidstAktiv: string;
  totalAktivSek: number;
  progress: Record<DisciplinId, DisciplinProgress>;
}

/**
 * Nulstil al progress for en elev (lærer-handling).
 * Kræver at lærer-RLS-policy tillader DELETE på progress (se supabase-schema.sql).
 * Eleven beholder sin konto og kode — kun progress-rækkerne slettes.
 */
export async function nulstilElevProgress(
  brugerId: string,
): Promise<{ ok: true } | { ok: false; fejl: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, fejl: 'Backend ikke tilgængelig' };
  const { error } = await supabase
    .from('progress')
    .delete()
    .eq('student_id', brugerId);
  if (error) {
    console.error('[laerer] kunne ikke nulstille:', error);
    return { ok: false, fejl: error.message };
  }
  return { ok: true };
}

export async function hentAlleEleverForLaerer(): Promise<ElevOversigt[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data: studs, error: studFejl } = await supabase
    .from('students')
    .select('*')
    .order('last_active', { ascending: false });
  if (studFejl) {
    console.error('[laerer] kunne ikke hente elever:', studFejl);
    return [];
  }

  const { data: progs, error: progFejl } = await supabase
    .from('progress')
    .select('*');
  if (progFejl) {
    console.error('[laerer] kunne ikke hente progress:', progFejl);
    return [];
  }

  // Group progress by student_id
  const byStudent = new Map<string, DBProgressRække[]>();
  for (const r of (progs ?? []) as DBProgressRække[]) {
    const list = byStudent.get(r.student_id) ?? [];
    list.push(r);
    byStudent.set(r.student_id, list);
  }

  return (studs ?? []).map((s) => {
    const tomt: Record<DisciplinId, DisciplinProgress> = {} as Record<
      DisciplinId,
      DisciplinProgress
    >;
    for (const d of DISCIPLINER) {
      tomt[d.id] = {
        status: 'untouched',
        bedsteScore: 0,
        antalForsoeg: 0,
        sidsteForsoeg: null,
        historik: [],
      };
    }
    for (const r of byStudent.get(s.id) ?? []) {
      const id = r.discipline_id as DisciplinId;
      if (!(id in tomt)) continue;
      tomt[id] = {
        status: r.status,
        bedsteScore: r.best_score,
        antalForsoeg: r.attempts,
        sidsteForsoeg: r.last_attempt,
        historik: r.history ?? [],
      };
    }
    return {
      brugerId: s.id,
      visningsnavn: s.display_name,
      navnSlug: s.name_slug,
      oprettet: s.created_at,
      sidstAktiv: s.last_active,
      totalAktivSek: s.total_active_seconds ?? 0,
      progress: tomt,
    };
  });
}

// ─────── Fejl-tolkning ───────

function tolkAuthFejl(
  signInBesked: string | undefined,
  signUpBesked: string,
): string {
  const samlet = `${signInBesked ?? ''} ${signUpBesked}`.toLowerCase();
  if (samlet.includes('user already registered') || samlet.includes('already')) {
    return 'Det navn er taget. Tjek koden eller vælg et andet navn.';
  }
  if (samlet.includes('weak password') || samlet.includes('password')) {
    return 'Koden er ikke gyldig. Brug 4 cifre.';
  }
  if (samlet.includes('rate')) {
    return 'For mange forsøg. Vent et minut og prøv igen.';
  }
  if (samlet.includes('network') || samlet.includes('failed to fetch')) {
    return 'Ingen forbindelse. Tjek dit internet.';
  }
  return 'Kunne ikke logge ind. Prøv igen.';
}

// ─────── Activity tracker ───────
//
// Tæller "aktiv tid" mens eleven bruger appen.
//
// Algorithm:
//   - Lyt på klik/taste/scroll/tap → opdatér lastInteraction-timestamp
//   - Hvert 5. sek: hvis fanen er synlig OG sidste interaktion var inden for
//     60 sek → tæl +5 sek (lokal store + pending-sync-buffer)
//   - Hvert 30. sek: send buffer som delta til Supabase via add_active_seconds()
//   - Når fanen skjules: best-effort flush af buffer
//
// Lærer-konti tracker vi ikke — de bruger ikke dashboardet/disciplin-routes
// hvor AuthGate (og dermed denne tracker) er mountet.

const AKTIV_IDLE_TIMEOUT_MS = 60_000;
const AKTIV_TICK_MS = 5_000;
const AKTIV_SYNC_MS = 30_000;
const AKTIV_MAX_PER_SYNC = 600; // matcher server-side cap

function useActivityTracker() {
  const signedInId = useStore((s) => s.signedInId);

  useEffect(() => {
    if (!signedInId) return;

    let lastInteraction = Date.now();
    let pendingSekunder = 0;

    const opdaterInteraktion = () => {
      lastInteraction = Date.now();
    };

    const events: (keyof DocumentEventMap)[] = [
      'click',
      'keydown',
      'touchstart',
      'scroll',
      'pointerdown',
    ];
    events.forEach((ev) =>
      window.addEventListener(ev, opdaterInteraktion, { passive: true }),
    );

    // Tick: tæl op hvis aktiv og synlig
    const tickId = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (Date.now() - lastInteraction > AKTIV_IDLE_TIMEOUT_MS) return;
      const tilfør = Math.floor(AKTIV_TICK_MS / 1000);
      pendingSekunder += tilfør;
      useStore.getState().inkrémentérAktiv(tilfør);
    }, AKTIV_TICK_MS);

    // Push buffer til Supabase
    const flushTilSupabase = async () => {
      if (pendingSekunder <= 0) return;
      const supabase = getSupabase();
      if (!supabase) return;
      const delta = Math.min(pendingSekunder, AKTIV_MAX_PER_SYNC);
      pendingSekunder -= delta;
      const { error } = await supabase.rpc('add_active_seconds', {
        seconds: delta,
      });
      if (error) {
        console.error('[activity] sync fejlede:', error);
        // Læg dem tilbage i bufferen, prøv igen næste gang
        pendingSekunder += delta;
      }
    };

    const syncId = window.setInterval(flushTilSupabase, AKTIV_SYNC_MS);

    // Best-effort: flush når fanen skjules
    const onVisibilityChange = () => {
      if (document.hidden && pendingSekunder > 0) {
        flushTilSupabase();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      events.forEach((ev) =>
        window.removeEventListener(ev, opdaterInteraktion),
      );
      window.clearInterval(tickId);
      window.clearInterval(syncId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      // Sidste flush ved unmount (logout)
      flushTilSupabase();
    };
  }, [signedInId]);
}

// ─────── Auth-gate ───────

/**
 * Wrap en side i `<AuthGate>` for at kræve login før indholdet vises.
 *
 * Snappy strategi: ingen spinner. Vi læser cachet auth-state fra Zustand
 * (persisteret i localStorage) og rendrer øjeblikkeligt enten dashboardet
 * eller overlay'en. I baggrunden verificerer useAuth mod Supabase.
 *
 * Adfærd:
 *  - Logget ind (cached): rendrer children direkte. Hvis cachen er forkert
 *    fanger background-verify det og overlay'en dukker op.
 *  - Ikke logget ind: rendrer children (blurred via wrapperen) + overlay
 *    med login-form. Eleven kan se dashboardet bag ved men ikke interagere.
 *  - Backend ikke konfigureret (env mangler): viser children, ingen overlay.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth();
  // Tracker aktiv tid mens eleven er logget ind. Hooket er no-op uden signedInId.
  useActivityTracker();

  if (!supabaseEnabled) return <>{children}</>;
  if (signedIn) return <>{children}</>;

  // Ikke logget ind: vis dashboardet i baggrunden + overlay ovenpå.
  return (
    <>
      <div
        className="pointer-events-none select-none blur-[6px] saturate-50 opacity-70"
        aria-hidden
      >
        {children}
      </div>
      <LoginOverlay />
    </>
  );
}

// ─────── LoginOverlay ───────
//
// Overlay som ligger oven på dashboardet (blurred). Premium / sparsom card med
// underline-inputs i stedet for kasser.

function LoginOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-md p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Log ind"
    >
      <LoginCard />
    </div>
  );
}

function LoginCard() {
  const { signedIn, visningsnavn } = useAuth();
  const [navn, setNavn] = useState('');
  const [kode, setKode] = useState('');
  const [fejl, setFejl] = useState<string | null>(null);
  const [submitter, setSubmitter] = useState(false);
  const [success, setSuccess] = useState<{ nyKonto: boolean; navn: string } | null>(null);
  const navnRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fokus på navne-feltet når overlay'en mounter
    const t = setTimeout(() => navnRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  async function håndterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);

    if (!erGyldigNavnLokal(navn)) {
      setFejl('Skriv et navn (mindst 2 bogstaver).');
      return;
    }
    if (!erGyldigKodeLokal(kode)) {
      setFejl('Koden skal være præcis 4 cifre.');
      return;
    }

    setSubmitter(true);
    const resultat = await logIndEllerOpret(navn, kode);
    setSubmitter(false);

    if (!resultat.ok) {
      setFejl(resultat.fejl);
      return;
    }
    setSuccess({ nyKonto: resultat.nyKonto, navn: resultat.visningsnavn });
    // AuthGate skjuler overlay'en automatisk når signedIn flipper
  }

  if (success || signedIn) {
    return (
      <MotionDivWrapper>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 text-center mb-3">
          {success?.nyKonto ? 'Konto oprettet' : 'Logget ind'}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-center">
          Hej, {success?.navn ?? visningsnavn ?? 'elev'}
        </h2>
        <p className="mt-2 text-sm text-slate-500 italic font-serif text-center">
          {success?.nyKonto
            ? 'Din kode er gemt. Husk den til næste gang.'
            : 'Din status er hentet ind.'}
        </p>
        <div className="mt-6 flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-slate-300" aria-hidden />
        </div>
      </MotionDivWrapper>
    );
  }

  return (
    <MotionDivWrapper>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 text-center mb-3">
        FP9 Matematik
      </p>
      <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-center">
        Log ind
      </h2>
      <p className="mt-2 mb-8 text-sm text-slate-500 italic font-serif text-center">
        Brug samme navn og kode som sidst.
      </p>

      <form onSubmit={håndterSubmit} className="space-y-7">
        <div>
          <label
            htmlFor="login-navn"
            className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1"
          >
            Navn
          </label>
          <input
            id="login-navn"
            ref={navnRef}
            type="text"
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            placeholder="Sara"
            autoComplete="off"
            spellCheck={false}
            maxLength={32}
            disabled={submitter}
            className="w-full bg-transparent border-0 border-b-2 border-slate-200 rounded-none px-0 py-2.5 font-display text-xl font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:border-slate-900 focus:outline-none transition-colors disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="login-kode"
            className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1"
          >
            4-cifret kode
          </label>
          <input
            id="login-kode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={kode}
            onChange={(e) =>
              setKode(e.target.value.replace(/\D/g, '').slice(0, 4))
            }
            placeholder="0000"
            autoComplete="off"
            maxLength={4}
            disabled={submitter}
            className="w-full bg-transparent border-0 border-b-2 border-slate-200 rounded-none px-0 py-2.5 font-display text-2xl font-bold tabular-nums tracking-[0.6em] text-slate-900 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-[0.4em] focus:border-slate-900 focus:outline-none transition-colors disabled:opacity-60"
          />
        </div>

        {fejl && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-sm text-rose-600"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <span>{fejl}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={submitter || !navn || kode.length !== 4}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {submitter ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Logger ind…
            </>
          ) : (
            <>
              Log ind
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[11px] text-slate-400">
        Glemt din kode? Spørg din lærer.
      </p>
    </MotionDivWrapper>
  );
}

/** Lokale validators så vi ikke skaber en cykel ved at importere fra supabase-client */
function erGyldigNavnLokal(navn: string): boolean {
  const slug = navn
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]/g, '');
  return slug.length >= 2;
}
function erGyldigKodeLokal(kode: string): boolean {
  return /^\d{4}$/.test(kode);
}

/** Card-wrapper med entry-animation. */
function MotionDivWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white px-7 py-9 sm:px-9 sm:py-11 shadow-2xl shadow-slate-900/10"
    >
      {children}
    </motion.div>
  );
}
