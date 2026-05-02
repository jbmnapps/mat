'use client';

/**
 * Login-side — navn + 4-cifret kode.
 *
 * Designprincip:
 *  - Ét felt for navn, ét for kode. Ingen "har du konto allerede?"-toggle.
 *  - Hvis navnet findes med samme kode = log ind. Hvis navnet er nyt =
 *    opret. Hvis navnet findes med anden kode = fejlbesked.
 *  - Eleven aner ikke om det er signin eller signup. UX-side er det altid
 *    bare "log ind".
 *  - Når logget ind: vi merger localStorage med server-progress og redirecter
 *    til dashboard.
 *
 * Visuel sammenhæng med dashboardet:
 *  - Samme yder-container (mx-auto + horisontal padding-trapper)
 *  - Samme typografi: font-display headings, italic font-serif subtitles
 *  - Form i et hvidt card med rounded-xl border-slate-200, samme som
 *    disciplin-kortene
 *  - Samme eyebrow-stil ("FP9 Matematik · Login")
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import {
  logIndEllerOpret,
  useAuth,
} from '@/lib/auth';
import {
  erGyldigKode,
  erGyldigNavn,
  supabaseEnabled,
} from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { signedIn, loading: authLoading, visningsnavn } = useAuth();
  const [navn, setNavn] = useState('');
  const [kode, setKode] = useState('');
  const [fejl, setFejl] = useState<string | null>(null);
  const [submitter, setSubmitter] = useState(false);
  const [success, setSuccess] = useState<{ nyKonto: boolean; navn: string } | null>(null);
  const navnRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navnRef.current?.focus();
  }, []);

  useEffect(() => {
    if (signedIn && !success) {
      const t = setTimeout(() => router.push('/'), 600);
      return () => clearTimeout(t);
    }
  }, [signedIn, success, router]);

  async function håndterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);

    if (!erGyldigNavn(navn)) {
      setFejl('Skriv et navn (mindst 2 bogstaver).');
      return;
    }
    if (!erGyldigKode(kode)) {
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
    setTimeout(() => router.push('/'), 1200);
  }

  // Backend ikke konfigureret (lokal dev uden .env.local)
  if (!supabaseEnabled) {
    return (
      <main className="min-h-[100dvh] bg-slate-50/40">
        <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-20 lg:py-28">
          <div className="text-center">
            <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              FP9 Matematik · Login
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3 lg:text-5xl">
              Login er ikke klar
            </h1>
            <p className="text-slate-600 italic font-serif">
              Træningen virker stadig — din status gemmes på din egen enhed.
              Spørg din lærer hvis login skal sættes op.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="min-h-[100dvh] bg-slate-50/40 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Indlæser" />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-slate-50/40">
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16 lg:py-24">
        {/* HEADER — matcher dashboardets eyebrow + h1 + subtitle-mønster */}
        <header className="mb-8 sm:mb-10 text-center">
          <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            FP9 Matematik · Træn til prøven
          </p>
          {success ? (
            <>
              <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                Hej, {success.navn}
              </h1>
              <p className="mt-2 text-slate-600 italic font-serif">
                {success.nyKonto
                  ? 'Din kode er gemt. Husk den — du skal bruge den næste gang.'
                  : 'Din status er hentet ind.'}
              </p>
            </>
          ) : signedIn ? (
            <>
              <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                Hej, {visningsnavn ?? 'elev'}
              </h1>
              <p className="mt-2 text-slate-600 italic font-serif">
                Du er allerede logget ind.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                Log ind
              </h1>
              <p className="mt-2 text-slate-600 italic font-serif">
                Brug det samme navn og kode som sidst. Hvis du er ny, oprettes
                din konto automatisk.
              </p>
            </>
          )}
        </header>

        {/* INDHOLD */}
        {success || signedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white p-6 text-center"
          >
            <Loader2 className="h-5 w-5 animate-spin text-slate-400 mx-auto" aria-hidden />
            <p className="mt-2 text-sm text-slate-500">Sender dig videre…</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={håndterSubmit}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="navn"
                  className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1.5"
                >
                  Navn
                </label>
                <input
                  id="navn"
                  ref={navnRef}
                  type="text"
                  value={navn}
                  onChange={(e) => setNavn(e.target.value)}
                  placeholder="Sara"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={32}
                  disabled={submitter}
                  className={cn(
                    'w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3',
                    'font-display text-lg font-semibold text-slate-900',
                    'placeholder:text-slate-300 placeholder:font-normal',
                    'focus:border-slate-900 focus:outline-none transition-colors',
                    'disabled:opacity-60',
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="kode"
                  className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1.5"
                >
                  4-cifret kode
                </label>
                <input
                  id="kode"
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
                  className={cn(
                    'w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3',
                    'font-display text-2xl font-bold tabular-nums tracking-[0.4em] text-slate-900',
                    'placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal',
                    'focus:border-slate-900 focus:outline-none transition-colors',
                    'disabled:opacity-60',
                  )}
                />
              </div>
            </div>

            {fejl && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                <span>{fejl}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitter || !navn || kode.length !== 4}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {submitter ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Logger ind…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" aria-hidden />
                  Log ind
                </>
              )}
            </button>
          </motion.form>
        )}

        {!success && !signedIn && (
          <p className="mt-6 text-center text-xs text-slate-400">
            Husk din kode — den kan ikke nulstilles.
            <br />
            Glemt den? Spørg din lærer.
          </p>
        )}
      </div>
    </main>
  );
}
