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
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, LogIn, Loader2, AlertCircle } from 'lucide-react';
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

  // Hvis allerede logget ind: vis kort bekræftelse + send tilbage
  useEffect(() => {
    if (signedIn && !success) {
      // Lille forsinkelse så brugeren ser at noget skete
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

  // Backend ikke konfigureret (lokal dev uden .env.local) — vis venlig besked
  if (!supabaseEnabled) {
    return (
      <main className="min-h-[100dvh] bg-slate-50/40 flex flex-col">
        <header className="px-6 py-6 lg:px-12 lg:py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Tilbage
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-6 -mt-12">
          <div className="max-w-md text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              Login
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mb-3">
              Login er ikke klar
            </h1>
            <p className="text-slate-600">
              Træningen virker stadig — din status gemmes på din egen enhed.
              Hvis du vil gemme status på tværs af enheder, så spørg din lærer
              om login er sat op endnu.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Venter på auth-tjek (kort)
  if (authLoading) {
    return (
      <main className="min-h-[100dvh] bg-slate-50/40 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Indlæser" />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-slate-50/40 flex flex-col">
      <header className="px-6 py-6 lg:px-12 lg:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Tilbage til oversigten
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12">
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              {success.nyKonto ? 'Konto oprettet' : 'Logget ind'}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Hej, {success.navn}
            </h1>
            <p className="text-slate-600">
              {success.nyKonto
                ? 'Din kode er gemt. Husk den — du skal bruge den næste gang.'
                : 'Din status er hentet ind.'}
            </p>
          </motion.div>
        ) : signedIn ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              Allerede logget ind
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Hej, {visningsnavn ?? 'elev'}
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md"
            >
              Til oversigten
            </Link>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={håndterSubmit}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3 text-center">
              FP9 Matematik · Login
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mb-2 text-center">
              Log ind
            </h1>
            <p className="text-sm text-slate-600 mb-8 text-center italic font-serif">
              Brug det samme navn og kode som sidst. Hvis du er ny, vælges din
              konto automatisk.
            </p>

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

            <p className="mt-6 text-center text-xs text-slate-400">
              Husk din kode — den kan ikke nulstilles. Glemt? Spørg din lærer.
            </p>
          </motion.form>
        )}
      </div>
    </main>
  );
}
