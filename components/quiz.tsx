'use client';

/**
 * Generisk Quiz-komponent — bruges af Træning (og senere Prøveklar).
 *
 * LAYOUT-PRINCIP:
 *  - Header øverst: tilbage-link + progress (3/12).
 *  - Center: opgave + svar-felt (numeric input eller multiple choice).
 *  - Bund: feedback efter svar + næste-knap.
 *  - Til sidst: score-skærm med tag-igen / tilbage.
 *
 * Tastatur:
 *  - Enter submitter svar (når input har fokus).
 *  - Enter går til næste opgave når feedback vises.
 *  - 1-9 vælger multiple choice option når den er aktiv.
 *
 * Progress:
 *  - I bølge 1 kalder vi `registrérPrøveklarForsoeg` fra både Træning og Prøveklar
 *    så eleven får synlig status på dashboardet. Splittes når Prøveklar-mode
 *    bygges (TODO: separat træning-tracking).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, X, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  type Opgave,
  parseTalInput,
  svarErRigtigt,
} from '@/lib/quiz-types';
import { useStore } from '@/lib/store';
import type { DisciplinId } from '@/lib/disciplines';

interface Props {
  disciplinId: DisciplinId;
  disciplinNavn: string;
  opgaver: Opgave[];
  /** Hvilken mode kalder quiz'en — bestemmer label og om vi gemmer status. */
  mode: 'traening' | 'proeveklar';
}

interface OpgaveResultat {
  opgave: Opgave;
  elevSvar: string;
  rigtigt: boolean;
}

export function Quiz({ disciplinId, disciplinNavn, opgaver, mode }: Props) {
  const [aktivIndex, setAktivIndex] = useState(0);
  const [resultater, setResultater] = useState<OpgaveResultat[]>([]);
  const [input, setInput] = useState('');
  const [valgtMC, setValgtMC] = useState<number | null>(null);
  const [feedbackVist, setFeedbackVist] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const næsteKnapRef = useRef<HTMLButtonElement>(null);

  const registrér = useStore((s) => s.registrérPrøveklarForsoeg);

  const aktivOpgave = opgaver[aktivIndex];
  const erFærdig = aktivIndex >= opgaver.length;
  const antalRigtige = resultater.filter((r) => r.rigtigt).length;
  const score = opgaver.length > 0 ? Math.round((antalRigtige / opgaver.length) * 100) : 0;

  // Fokus på input ved ny opgave
  useEffect(() => {
    if (erFærdig || feedbackVist) return;
    if (aktivOpgave?.type === 'numeric') {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [aktivIndex, feedbackVist, erFærdig, aktivOpgave]);

  // Fokus på næste-knap når feedback vises
  useEffect(() => {
    if (feedbackVist && !erFærdig) {
      const t = setTimeout(() => næsteKnapRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [feedbackVist, erFærdig]);

  // Gem score når quiz er færdig
  useEffect(() => {
    if (erFærdig && resultater.length === opgaver.length && opgaver.length > 0) {
      registrér(disciplinId, score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erFærdig]);

  // Tastatur: tal-tast vælger MC, Enter submitter / går videre
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (erFærdig) return;

      if (feedbackVist && e.key === 'Enter') {
        e.preventDefault();
        gåVidere();
        return;
      }

      if (!feedbackVist && aktivOpgave?.type === 'multiple-choice') {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= aktivOpgave.muligheder.length) {
          e.preventDefault();
          setValgtMC(num - 1);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackVist, aktivOpgave, erFærdig]);

  const submitNumeric = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!aktivOpgave || aktivOpgave.type !== 'numeric') return;
      const parsed = parseTalInput(input);
      if (Number.isNaN(parsed)) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      const rigtigt = svarErRigtigt(aktivOpgave, parsed);
      setResultater((prev) => [...prev, { opgave: aktivOpgave, elevSvar: input, rigtigt }]);
      setFeedbackVist(true);
    },
    [aktivOpgave, input],
  );

  const submitMC = useCallback(() => {
    if (!aktivOpgave || aktivOpgave.type !== 'multiple-choice' || valgtMC === null) return;
    const rigtigt = svarErRigtigt(aktivOpgave, valgtMC);
    setResultater((prev) => [
      ...prev,
      { opgave: aktivOpgave, elevSvar: aktivOpgave.muligheder[valgtMC], rigtigt },
    ]);
    setFeedbackVist(true);
  }, [aktivOpgave, valgtMC]);

  const gåVidere = useCallback(() => {
    setFeedbackVist(false);
    setInput('');
    setValgtMC(null);
    setAktivIndex((i) => i + 1);
  }, []);

  const startForfra = useCallback(() => {
    setAktivIndex(0);
    setResultater([]);
    setInput('');
    setValgtMC(null);
    setFeedbackVist(false);
  }, []);

  // ─────── Score-skærm ───────
  if (erFærdig) {
    return (
      <main className="min-h-screen bg-slate-50/40 flex flex-col">
        <header className="px-6 py-6 lg:px-12 lg:py-8">
          <Link
            href={`/${disciplinId}/`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Tilbage til {disciplinNavn.toLowerCase()}
          </Link>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
              Du er færdig
            </p>
            <div className="font-display text-8xl font-bold tracking-tight text-slate-900 lg:text-9xl mb-2">
              {score}%
            </div>
            <p className="text-lg text-slate-600 mb-10">
              {antalRigtige} ud af {opgaver.length} rigtige
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={startForfra}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Tag igen
              </button>
              <Link
                href={`/${disciplinId}/`}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Tilbage til {disciplinNavn.toLowerCase()}
              </Link>
            </div>

            {/* Opgave-oversigt */}
            <div className="mt-12 text-left max-w-md mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-3">
                Dine svar
              </p>
              <ul className="space-y-2">
                {resultater.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                        r.rigtigt ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                      )}
                      aria-hidden
                    >
                      {r.rigtigt ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900">{r.opgave.spørgsmål}</p>
                      {!r.rigtigt && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Du svarede: <span className="font-semibold">{r.elevSvar}</span>
                          {' · '}
                          Rigtigt:{' '}
                          <span className="font-semibold">
                            {r.opgave.type === 'numeric'
                              ? formaterTal(r.opgave.svar)
                              : r.opgave.muligheder[r.opgave.rigtigIndex]}
                          </span>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ─────── Aktiv opgave ───────
  if (!aktivOpgave) return null;
  const sidsteResultat = feedbackVist ? resultater[resultater.length - 1] : null;
  const erSidste = aktivIndex === opgaver.length - 1;

  return (
    <main className="min-h-screen bg-slate-50/40 flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 lg:px-12 lg:py-8 flex items-center justify-between gap-4">
        <Link
          href={`/${disciplinId}/`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Afslut {mode === 'traening' ? 'træning' : 'prøveklar'}
        </Link>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 tabular-nums">
          Opgave {aktivIndex + 1} / {opgaver.length}
        </div>
      </header>

      {/* Progress-bar */}
      <div className="px-6 lg:px-12">
        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-slate-900"
            initial={false}
            animate={{ width: `${(aktivIndex / opgaver.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={aktivOpgave.id + (feedbackVist ? '-fb' : '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, x: shake ? [-6, 6, -6, 6, 0] : 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={shake ? { duration: 0.4 } : { duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-xl"
          >
            {/* Spørgsmål */}
            <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-center mb-8 leading-snug">
              {aktivOpgave.spørgsmål}
            </h2>

            {/* Svar-område */}
            {aktivOpgave.type === 'numeric' && !feedbackVist && (
              <form onSubmit={submitNumeric} className="flex flex-col items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoComplete="off"
                    aria-label="Dit svar"
                    className="w-48 text-center font-display text-5xl lg:text-6xl font-bold tabular-nums text-slate-900 bg-transparent border-b-[3px] border-slate-300 focus:border-emerald-600 focus:outline-none caret-emerald-600 py-2"
                  />
                  {aktivOpgave.enhed && (
                    <span className="font-display text-3xl font-bold text-slate-500">
                      {aktivOpgave.enhed}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={input.trim() === ''}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Svar
                </button>
              </form>
            )}

            {aktivOpgave.type === 'multiple-choice' && !feedbackVist && (
              <div className="flex flex-col items-center gap-4">
                <div className="grid gap-2 w-full">
                  {aktivOpgave.muligheder.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setValgtMC(i)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border-2 px-5 py-3 text-left transition-all',
                        'hover:border-slate-300 hover:bg-white',
                        valgtMC === i
                          ? 'border-slate-900 bg-white shadow-sm'
                          : 'border-slate-200 bg-white/60',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                          valgtMC === i
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-500',
                        )}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span className="font-display text-lg font-semibold text-slate-900">
                        {m}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={submitMC}
                  disabled={valgtMC === null}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Svar
                </button>
              </div>
            )}

            {/* Feedback */}
            {feedbackVist && sidsteResultat && (
              <div className="flex flex-col items-center gap-4">
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
                    sidsteResultat.rigtigt
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700',
                  )}
                >
                  {sidsteResultat.rigtigt ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Rigtigt
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" aria-hidden />
                      Forkert
                    </>
                  )}
                </div>

                {!sidsteResultat.rigtigt && (
                  <p className="text-center text-base text-slate-700">
                    Det rigtige svar er{' '}
                    <span className="font-display text-2xl font-bold text-slate-900">
                      {aktivOpgave.type === 'numeric'
                        ? formaterTal(aktivOpgave.svar)
                        : aktivOpgave.muligheder[aktivOpgave.rigtigIndex]}
                    </span>
                  </p>
                )}

                {aktivOpgave.forklaring && (
                  <p className="text-center text-sm text-slate-600 italic font-serif max-w-md">
                    {aktivOpgave.forklaring}
                  </p>
                )}

                <button
                  ref={næsteKnapRef}
                  onClick={gåVidere}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md mt-2"
                >
                  {erSidste ? 'Se resultat' : 'Næste opgave'}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hint */}
      {!feedbackVist && (
        <div className="px-6 pb-8 text-center">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-400">
            Tryk{' '}
            <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 mx-1 rounded border border-slate-300 bg-white text-[11px] font-mono">
              Enter
            </kbd>{' '}
            for at svare
          </span>
        </div>
      )}
    </main>
  );
}

/** Formatér et tal med dansk decimal-tegn (komma). */
function formaterTal(n: number): string {
  return String(n).replace('.', ',');
}
