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

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
 * Hook der eksponerer den aktuelle auth-tilstand. Lytter til Supabase's
 * auth-events og opdaterer Zustand-storen så resten af appen kan se
 * via useStore.
 */
export function useAuth(): AuthStatus {
  const [loading, setLoading] = useState(true);
  const signedInId = useStore((s) => s.signedInId);
  const signedInNavn = useStore((s) => s.signedInNavn);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let aktiv = true;

    // Hent eksisterende session
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
        useStore.getState().setSignedIn(null, null);
      }
      setLoading(false);
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
    loading,
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
  progress: Record<DisciplinId, DisciplinProgress>;
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

// ─────── Auth-gate ───────

/**
 * Wrap en side i `<AuthGate>` for at kræve login før indholdet vises.
 *
 * Adfærd:
 *  - Mens auth-state hentes: spinner.
 *  - Ikke logget ind: redirect til /login/, viser spinner mens redirect kører.
 *  - Logget ind (elev eller lærer): viser children.
 *  - Hvis backend ikke er konfigureret (env-vars mangler): vis altid children
 *    så lokal dev fungerer som før.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, signedIn } = useAuth();

  useEffect(() => {
    if (!supabaseEnabled) return;
    if (loading) return;
    if (!signedIn && pathname !== '/login') {
      router.replace('/login/');
    }
  }, [loading, signedIn, router, pathname]);

  if (!supabaseEnabled) return <>{children}</>;
  if (loading || !signedIn) return <FuldsideSpinner />;
  return <>{children}</>;
}

function FuldsideSpinner() {
  return (
    <main
      className="min-h-[100dvh] bg-slate-50/40 flex items-center justify-center"
      aria-label="Indlæser"
    >
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-hidden />
    </main>
  );
}
