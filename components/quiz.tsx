'use client';

/**
 * Generisk Quiz-komponent — bruges af Træning (og senere Prøveklar).
 *
 * LAYOUT-PRINCIP (efter elev-feedback):
 *  - Spørgsmål og svar-felt skifter ALDRIG position når man trykker Enter.
 *  - Feedback (Rigtigt/Forkert) og evt. forklaring dukker op UNDER svar-feltet.
 *  - Svar-knappen morfer til "Næste opgave"-knap.
 *  - Vi viser IKKE det rigtige svar inline — kun forklaring som hint.
 *    Det rigtige svar afsløres på score-skærmen til sidst.
 *  - Ingen "prøv igen"-knap. Tallet/valget bliver stående.
 *
 * Lærer-mode:
 *  - Aktiveres ved at åbne en hvilken som helst side med ?l=1 i URL'en.
 *    Dette gemmer flaget i localStorage så det persisterer.
 *  - Viser en lille "Spring over"-knap i bunden + tastatur-shortcut Cmd/Ctrl+→.
 *  - Eleverne får aldrig URL'en og ser derfor ikke knappen.
 *
 * Tastatur:
 *  - Enter submitter svar (når input har fokus).
 *  - Enter går til næste opgave når feedback vises.
 *  - 1-9 vælger multiple choice option.
 *  - Cmd/Ctrl+→ springer over (lærer-mode).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, X, RotateCcw, SkipForward } from 'lucide-react';
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
  const [erLærer, setErLærer] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const næsteKnapRef = useRef<HTMLButtonElement>(null);

  const registrér = useStore((s) => s.registrérPrøveklarForsoeg);

  const aktivOpgave = opgaver[aktivIndex];
  const erFærdig = aktivIndex >= opgaver.length;
  const antalRigtige = resultater.filter((r) => r.rigtigt).length;
  const score = opgaver.length > 0 ? Math.round((antalRigtige / opgaver.length) * 100) : 0;
  const sidsteResultat = feedbackVist ? resultater[resultater.length - 1] : null;
  const erSidste = aktivIndex === opgaver.length - 1;

  // Aktiver lærer-mode via ?l=1 query param eller eksisterende localStorage flag
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('l') === '1') {
      localStorage.setItem('lærerMode', '1');
      setErLærer(true);
    } else if (localStorage.getItem('lærerMode') === '1') {
      setErLærer(true);
    }
  }, []);

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
    if (erFærdig && resultater.length > 0 && opgaver.length > 0) {
      registrér(disciplinId, score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erFærdig]);

  const submitNumeric = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!aktivOpgave || aktivOpgave.type !== 'numeric' || feedbackVist) return;
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
    [aktivOpgave, input, feedbackVist],
  );

  const submitMC = useCallback(() => {
    if (!aktivOpgave || aktivOpgave.type !== 'multiple-choice' || valgtMC === null || feedbackVist)
      return;
    const rigtigt = svarErRigtigt(aktivOpgave, valgtMC);
    setResultater((prev) => [
      ...prev,
      { opgave: aktivOpgave, elevSvar: aktivOpgave.muligheder[valgtMC], rigtigt },
    ]);
    setFeedbackVist(true);
  }, [aktivOpgave, valgtMC, feedbackVist]);

  const gåVidere = useCallback(() => {
    setFeedbackVist(false);
    setInput('');
    setValgtMC(null);
    setAktivIndex((i) => i + 1);
  }, []);

  const springOver = useCallback(() => {
    // Lærer-skip: avancér uden at registrere som svar
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

  // Tastatur: Enter går videre når feedback vises, tal-tast vælger MC, Cmd/Ctrl+→ skip (lærer)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (erFærdig) return;

      // Lærer-skip
      if (erLærer && (e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        springOver();
        return;
      }

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
  }, [feedbackVist, aktivOpgave, erFærdig, erLærer, gåVidere, springOver]);

  // ─────── Score-skærm ───────
  if (erFærdig) {
    return (
      <main className="min-h-[100dvh] bg-slate-50/40 flex flex-col">
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
              {antalRigtige} ud af {resultater.length} rigtige
              {resultater.length < opgaver.length && (
                <span className="text-slate-400">
                  {' '}
                  · {opgaver.length - resultater.length} sprunget over
                </span>
              )}
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

  return (
    <main className="min-h-[100dvh] bg-slate-50/40 flex flex-col">
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

      {/* Center — top-anchored så spørgsmål og input står på samme position
          uafhængigt af om feedback vises eller ej. Feedback dukker op naturligt
          mellem input og næste-knap; intet shifter ovenfor.
          På mobil holder vi spørgsmål højere oppe (pt-[8vh]) så det
          ikke gemmer sig bag tastaturet når input får fokus. */}
      <div className="flex-1 flex flex-col items-center px-6 pt-[8vh] sm:pt-[18vh] lg:pt-[20vh]">
        <div className="w-full max-w-xl">
          {/* Spørgsmål */}
          <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-center mb-10 leading-snug">
            {aktivOpgave.spørgsmål}
          </h2>

          {/* Numeric input */}
          {aktivOpgave.type === 'numeric' && (
            <form onSubmit={submitNumeric} className="flex flex-col items-center gap-6">
              {/* Input-wrapper er fixed-width og centreret. Enhed er absolut
                  positioneret til højre, så input ALTID forbliver centreret
                  uanset om enhed vises eller ej. Tidligere flex-row centrerede
                  HELE rækken, hvilket skubbede input til venstre når enhed
                  fyldte plads — det fik feedback/næste-knap til at virke
                  forskudt på opgaver som "elever"-opgaven. */}
              <motion.div
                animate={{ x: shake ? [-6, 6, -6, 6, 0] : 0 }}
                transition={{ duration: 0.4 }}
                className="relative mx-auto w-48"
              >
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value.replace(/[^0-9,.\-\s]/g, ''))
                  }
                  disabled={feedbackVist}
                  autoComplete="off"
                  aria-label="Dit svar"
                  className={cn(
                    'w-full text-center font-display text-5xl lg:text-6xl font-bold tabular-nums bg-transparent border-b-[3px] focus:outline-none caret-emerald-600 py-2 transition-colors',
                    !feedbackVist && 'border-slate-300 focus:border-emerald-600 text-slate-900',
                    feedbackVist && sidsteResultat?.rigtigt && 'border-emerald-500 text-emerald-700',
                    feedbackVist && !sidsteResultat?.rigtigt && 'border-rose-500 text-rose-700',
                  )}
                />
                {aktivOpgave.enhed && (
                  <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 font-display text-3xl font-bold text-slate-500 whitespace-nowrap">
                    {aktivOpgave.enhed}
                  </span>
                )}
              </motion.div>

              <FeedbackOgKnap
                feedbackVist={feedbackVist}
                rigtigt={sidsteResultat?.rigtigt ?? false}
                forklaring={aktivOpgave.forklaring}
                næsteKnapRef={næsteKnapRef}
                gåVidere={gåVidere}
                erSidste={erSidste}
                kanSubmitte={input.trim() !== ''}
              />
            </form>
          )}

          {/* Multiple choice */}
          {aktivOpgave.type === 'multiple-choice' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitMC();
              }}
              className="flex flex-col items-center gap-6"
            >
              <div className="grid gap-2 w-full">
                {aktivOpgave.muligheder.map((m, i) => {
                  const erValgt = valgtMC === i;
                  const visGrøn = feedbackVist && erValgt && sidsteResultat?.rigtigt;
                  const visRød = feedbackVist && erValgt && !sidsteResultat?.rigtigt;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !feedbackVist && setValgtMC(i)}
                      disabled={feedbackVist}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border-2 px-5 py-3 text-left transition-all',
                        !feedbackVist && 'hover:border-slate-300 hover:bg-white cursor-pointer',
                        !feedbackVist && erValgt && 'border-slate-900 bg-white shadow-sm',
                        !feedbackVist && !erValgt && 'border-slate-200 bg-white/60',
                        feedbackVist && !erValgt && 'border-slate-200 bg-white/40 opacity-60',
                        visGrøn && 'border-emerald-500 bg-emerald-50',
                        visRød && 'border-rose-500 bg-rose-50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                          !feedbackVist && erValgt && 'bg-slate-900 text-white',
                          !feedbackVist && !erValgt && 'bg-slate-100 text-slate-500',
                          visGrøn && 'bg-emerald-500 text-white',
                          visRød && 'bg-rose-500 text-white',
                          feedbackVist && !erValgt && 'bg-slate-100 text-slate-400',
                        )}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span
                        className={cn(
                          'font-display text-lg font-semibold',
                          visRød ? 'text-rose-700' : visGrøn ? 'text-emerald-700' : 'text-slate-900',
                        )}
                      >
                        {m}
                      </span>
                    </button>
                  );
                })}
              </div>

              <FeedbackOgKnap
                feedbackVist={feedbackVist}
                rigtigt={sidsteResultat?.rigtigt ?? false}
                forklaring={aktivOpgave.forklaring}
                næsteKnapRef={næsteKnapRef}
                gåVidere={gåVidere}
                erSidste={erSidste}
                kanSubmitte={valgtMC !== null}
              />
            </form>
          )}
        </div>
      </div>

      {/* Bund: hint + (lærer) skip */}
      <div className="px-6 pb-8 flex items-center justify-between gap-4">
        {!feedbackVist ? (
          <span className="hidden sm:inline-flex text-xs uppercase tracking-[0.2em] font-semibold text-slate-400">
            Tryk{' '}
            <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 mx-1 rounded border border-slate-300 bg-white text-[11px] font-mono">
              Enter
            </kbd>{' '}
            for at svare
          </span>
        ) : (
          <span />
        )}

        {erLærer && (
          <button
            type="button"
            onClick={springOver}
            title="Lærer-skip (Cmd/Ctrl + →)"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <SkipForward className="h-3.5 w-3.5" aria-hidden />
            Spring over
          </button>
        )}
      </div>
    </main>
  );
}

// ============================================================================
// Feedback + svar/næste-knap
// Brugt af både numeric og MC. For numeric ligger den inde i form'en, så Svar-knappen
// fungerer som submit. For MC ligger den uden for, og Svar-knappen håndteres separat.
// ============================================================================

interface FeedbackProps {
  feedbackVist: boolean;
  rigtigt: boolean;
  forklaring?: string;
  næsteKnapRef: React.RefObject<HTMLButtonElement | null>;
  gåVidere: () => void;
  erSidste: boolean;
  kanSubmitte: boolean;
}

function FeedbackOgKnap({
  feedbackVist,
  rigtigt,
  forklaring,
  næsteKnapRef,
  gåVidere,
  erSidste,
  kanSubmitte,
}: FeedbackProps) {
  return (
    <>
      {/* Feedback — kun når der er svaret. Top-anchored layout sørger for
          at spørgsmål + input ikke shifter, så vi behøver ingen reserveret højde. */}
      {feedbackVist && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
              rigtigt ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
            )}
          >
            {rigtigt ? (
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

          {!rigtigt && forklaring && (
            <p className="text-center text-sm text-slate-600 italic font-serif max-w-md">
              {forklaring}
            </p>
          )}
        </motion.div>
      )}

      {/* Svar-knap (før submit) eller Næste-knap (efter) — samme position altid */}
      {!feedbackVist && (
        <button
          type="submit"
          disabled={!kanSubmitte}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Svar
        </button>
      )}

      {feedbackVist && (
        <button
          ref={næsteKnapRef}
          type="button"
          onClick={gåVidere}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md"
        >
          {erSidste ? 'Se resultat' : 'Næste opgave'}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </>
  );
}

/** Formatér et tal med dansk decimal-tegn (komma). */
function formaterTal(n: number): string {
  return String(n).replace('.', ',');
}
