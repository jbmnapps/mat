'use client';

/**
 * Lærer-login på /laerer/.
 *
 * Den eksisterende /laerer/<token>/ side bevares som destination, men læreren
 * behøver ikke kende eller gemme hele linket. Hvis lærer-sessionen stadig er
 * aktiv, sendes brugeren direkte videre.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Loader2, LockKeyhole } from 'lucide-react';
import { logIndSomLaerer } from '@/lib/auth';
import {
  getSupabase,
  LAERER_EMAIL,
  supabaseEnabled,
} from '@/lib/supabase-client';

export default function LaererLoginPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [adgangskode, setAdgangskode] = useState('');
  const [fejl, setFejl] = useState<string | null>(null);
  const [loggerInd, setLoggerInd] = useState(false);
  const [tjekkerSession, setTjekkerSession] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    const token = process.env.NEXT_PUBLIC_LAERER_TOKEN;
    if (!supabase || !token) {
      setTjekkerSession(false);
      return;
    }

    let aktiv = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!aktiv) return;
      if (data.session?.user.email === LAERER_EMAIL) {
        router.replace(`/laerer/${encodeURIComponent(token)}/`);
        return;
      }
      setTjekkerSession(false);
    }).catch(() => {
      if (aktiv) setTjekkerSession(false);
    });

    return () => {
      aktiv = false;
    };
  }, [router]);

  useEffect(() => {
    if (!tjekkerSession) {
      inputRef.current?.focus();
    }
  }, [tjekkerSession]);

  async function håndterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);

    const adgang = adgangskode.trim();
    if (!adgang) {
      setFejl('Skriv lærer-adgangskoden.');
      return;
    }

    setLoggerInd(true);
    const resultat = await logIndSomLaerer(adgang);
    setLoggerInd(false);

    if (!resultat.ok) {
      setFejl(
        resultat.fejl === 'Forkert link.'
          ? 'Forkert adgangskode.'
          : resultat.fejl,
      );
      return;
    }

    router.replace(`/laerer/${encodeURIComponent(resultat.token)}/`);
  }

  return (
    <main className="min-h-[100dvh] bg-slate-50/40 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white px-7 py-9 shadow-2xl shadow-slate-900/10 sm:px-9 sm:py-11"
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
          aria-hidden
        >
          <LockKeyhole className="h-5 w-5" />
        </div>

        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          FP9 Matematik
        </p>
        <h1 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Lærer-login
        </h1>
        <p className="mt-2 mb-8 text-center font-serif text-sm italic text-slate-500">
          Se elevstatus og aktivitet.
        </p>

        {!supabaseEnabled ? (
          <div className="flex items-start gap-2 text-sm text-rose-600" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>Backend er ikke konfigureret.</span>
          </div>
        ) : tjekkerSession ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Tjekker login…
          </div>
        ) : (
          <form onSubmit={håndterSubmit} className="space-y-7">
            <div>
              <label
                htmlFor="laerer-adgangskode"
                className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"
              >
                Adgangskode
              </label>
              <input
                id="laerer-adgangskode"
                ref={inputRef}
                type="password"
                value={adgangskode}
                onChange={(e) => setAdgangskode(e.target.value)}
                autoComplete="current-password"
                disabled={loggerInd}
                className="w-full rounded-none border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2.5 font-display text-xl font-semibold text-slate-900 transition-colors placeholder:font-normal placeholder:text-slate-300 focus:border-slate-900 focus:outline-none disabled:opacity-60"
              />
            </div>

            {fejl && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 text-sm text-rose-600"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{fejl}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loggerInd || !adgangskode.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {loggerInd ? (
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
        )}
      </motion.div>
    </main>
  );
}
