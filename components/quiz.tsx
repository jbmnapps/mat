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
import { motion, AnimatePresence } from 'motion/react';
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
  // True KUN i tidsrummet mellem submit på current opgave og næste-klik.
  // Adskiller "just-submitted" fra "review af tidligere opgave" — vigtigt fordi
  // `aktivIndex < resultater.length` er sand i begge tilfælde (resultater bliver
  // appended ved submit). Uden dette flag vil "Næste opgave"-knappen kalde
  // navigerFrem (bevarer state) i stedet for gåVidere (rydder state), så forrige
  // svar+feedback hænger ved på næste opgave. Se AUDIT.md sektion 1.1.
  const [justSubmitted, setJustSubmitted] = useState(false);
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

  // Review-mode: eleven er gået tilbage til en allerede besvaret opgave
  // for at se sit svar + feedback igen. Display-state hentes fra resultater
  // i stedet for fra det levende input/valgtMC/feedbackVist.
  // !justSubmitted ekskluderer det øjeblikkelige "lige svaret current"-state,
  // hvor aktivIndex < resultater.length er sand men det IKKE er review.
  const erReview = aktivIndex < resultater.length && !justSubmitted;
  const reviewResultat = erReview ? resultater[aktivIndex] : null;
  const visFeedback = erReview || feedbackVist;
  const visResultat = erReview ? reviewResultat : sidsteResultat;
  const visInputValue =
    erReview && aktivOpgave?.type === 'numeric' ? String(reviewResultat!.elevSvar) : input;
  const visMCIndex =
    erReview && aktivOpgave?.type === 'multiple-choice' && reviewResultat
      ? aktivOpgave.muligheder.findIndex((m) => m === reviewResultat.elevSvar)
      : valgtMC;

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

  // Fokus på input ved ny opgave (kun når der ER en input at fokusere på —
  // ikke i review-mode, hvor input er disabled)
  useEffect(() => {
    if (erFærdig || feedbackVist || erReview) return;
    if (aktivOpgave?.type === 'numeric') {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [aktivIndex, feedbackVist, erReview, erFærdig, aktivOpgave]);

  // Fokus på næste-knap når feedback vises (gælder også review-mode)
  useEffect(() => {
    if (visFeedback && !erFærdig) {
      const t = setTimeout(() => næsteKnapRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [visFeedback, erFærdig]);

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
      setJustSubmitted(true);
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
    setJustSubmitted(true);
  }, [aktivOpgave, valgtMC, feedbackVist]);

  const gåVidere = useCallback(() => {
    setFeedbackVist(false);
    setJustSubmitted(false);
    setInput('');
    setValgtMC(null);
    setAktivIndex((i) => i + 1);
  }, []);

  // Navigation til allerede-besvarede opgaver. Adskiller sig fra gåVidere
  // ved IKKE at rydde input/feedbackVist — dem hentes display-state via
  // erReview-deriveringen i stedet. justSubmitted nulstilles dog så
  // næsteHandler skifter fra gåVidere til navigerFrem.
  const navigerTilbage = useCallback(() => {
    setJustSubmitted(false);
    setAktivIndex((i) => Math.max(0, i - 1));
  }, []);

  const navigerFrem = useCallback(() => {
    // Kun frem inden for allerede-besvarede opgaver. Når man rammer current
    // (just-answered), bruger man gåVidere for at avancere.
    setJustSubmitted(false);
    setAktivIndex((i) => i + 1);
  }, []);

  // Vælges af "Næste opgave"-knappen. Lige efter submit på current →
  // gåVidere (rydder state). I review-mode → navigerFrem (bevarer state).
  const næsteHandler = justSubmitted ? gåVidere : navigerFrem;

  const springOver = useCallback(() => {
    // Lærer-skip: avancér uden at registrere som svar
    setFeedbackVist(false);
    setJustSubmitted(false);
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
    setJustSubmitted(false);
  }, []);

  // Tastatur: Enter går videre når feedback vises, tal-tast vælger MC,
  // Cmd/Ctrl+→ skip (lærer), ←/→ navigerer mellem allerede-besvarede opgaver.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (erFærdig) return;

      // Lærer-skip
      if (erLærer && (e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        springOver();
        return;
      }

      // Pile-navigation kun når vi IKKE er i et input-felt (ellers skal
      // pilene flytte cursoren som normalt)
      const erIInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      if (!erIInput && e.key === 'ArrowLeft' && aktivIndex > 0) {
        e.preventDefault();
        navigerTilbage();
        return;
      }
      if (!erIInput && e.key === 'ArrowRight' && erReview) {
        e.preventDefault();
        navigerFrem();
        return;
      }

      if (visFeedback && e.key === 'Enter') {
        e.preventDefault();
        næsteHandler();
        return;
      }

      if (!visFeedback && aktivOpgave?.type === 'multiple-choice') {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= aktivOpgave.muligheder.length) {
          e.preventDefault();
          setValgtMC(num - 1);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    visFeedback,
    aktivOpgave,
    erFærdig,
    erLærer,
    aktivIndex,
    erReview,
    næsteHandler,
    navigerTilbage,
    navigerFrem,
    springOver,
  ]);

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

        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-8 lg:-mt-12">
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
    // h-[100dvh] + overflow-hidden: når iOS-keyboard popper op, krymper
    // viewport. Med min-h-[100dvh] overflower indholdet under keyboardet
    // og siden bliver scrollable. Med fixed h + overflow-hidden låses
    // højden til faktisk synlig plads — keyboard skubber ikke content,
    // og side er ikke længere scrollable.
    <main className="h-[100dvh] overflow-hidden bg-slate-50/40 flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 lg:px-12 lg:py-8 flex items-center justify-between gap-4">
        <Link
          href={`/${disciplinId}/`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Afslut {mode === 'traening' ? 'træning' : 'prøveklar'}
        </Link>

        {/* Progress + tilbage-knap. Tilbage-knap vises kun når der ER en
            tidligere opgave at gå til. Eleven kan så bladre i sine svar. */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={navigerTilbage}
            disabled={aktivIndex === 0}
            aria-label="Tilbage til forrige opgave"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500',
              'transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          </button>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 tabular-nums">
            Opgave {aktivIndex + 1} / {opgaver.length}
          </div>
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
      <div className="flex-1 flex flex-col items-center px-6 pt-[12vh] sm:pt-[18vh] lg:pt-[20vh]">
        <div className="w-full max-w-xl">
          {/* Spørgsmål */}
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-center mb-6 sm:mb-10 leading-snug">
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
                  value={visInputValue}
                  onChange={(e) =>
                    setInput(e.target.value.replace(/[^0-9,.\-\s]/g, ''))
                  }
                  disabled={visFeedback}
                  autoComplete="off"
                  aria-label="Dit svar"
                  className={cn(
                    'w-full text-center font-display text-4xl sm:text-5xl lg:text-6xl font-bold tabular-nums bg-transparent border-b-[3px] focus:outline-none caret-emerald-600 py-2 transition-colors',
                    !visFeedback && 'border-slate-300 focus:border-emerald-600 text-slate-900',
                    visFeedback && visResultat?.rigtigt && 'border-emerald-500 text-emerald-700',
                    visFeedback && !visResultat?.rigtigt && 'border-rose-500 text-rose-700',
                  )}
                />
                {aktivOpgave.enhed && (
                  <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 font-display text-3xl font-bold text-slate-500 whitespace-nowrap">
                    {aktivOpgave.enhed}
                  </span>
                )}
              </motion.div>

              <FeedbackOgKnap
                feedbackVist={visFeedback}
                rigtigt={visResultat?.rigtigt ?? false}
                forklaring={aktivOpgave.forklaring}
                næsteKnapRef={næsteKnapRef}
                gåVidere={næsteHandler}
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
                  const erValgt = visMCIndex === i;
                  const visGrøn = visFeedback && erValgt && visResultat?.rigtigt;
                  const visRød = visFeedback && erValgt && !visResultat?.rigtigt;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !visFeedback && setValgtMC(i)}
                      disabled={visFeedback}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border-2 px-5 py-3 text-left transition-all',
                        !visFeedback && 'hover:border-slate-300 hover:bg-white cursor-pointer',
                        !visFeedback && erValgt && 'border-slate-900 bg-white shadow-sm',
                        !visFeedback && !erValgt && 'border-slate-200 bg-white/60',
                        visFeedback && !erValgt && 'border-slate-200 bg-white/40 opacity-60',
                        visGrøn && 'border-emerald-500 bg-emerald-50',
                        visRød && 'border-rose-500 bg-rose-50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                          !visFeedback && erValgt && 'bg-slate-900 text-white',
                          !visFeedback && !erValgt && 'bg-slate-100 text-slate-500',
                          visGrøn && 'bg-emerald-500 text-white',
                          visRød && 'bg-rose-500 text-white',
                          visFeedback && !erValgt && 'bg-slate-100 text-slate-400',
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
                feedbackVist={visFeedback}
                rigtigt={visResultat?.rigtigt ?? false}
                forklaring={aktivOpgave.forklaring}
                næsteKnapRef={næsteKnapRef}
                gåVidere={næsteHandler}
                erSidste={erSidste}
                kanSubmitte={valgtMC !== null}
              />
            </form>
          )}
        </div>
      </div>

      {/* Bund: hint + (lærer) skip */}
      <div className="px-6 pb-8 flex items-center justify-between gap-4">
        {!visFeedback ? (
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
      {/* Feedback animeres ind/ud fra højde 0 → auto, så knappen nedenfor
          glider på plads i stedet for at hoppe. AnimatePresence + height-auto
          + overflow:hidden er det rene mønster. */}
      <AnimatePresence initial={false}>
        {feedbackVist && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <div className="flex flex-col items-center gap-3 pt-2">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Én knap der skifter rolle (submit ↔ næste) i stedet for to der
          mountes/unmountes. Forbliver i DOM så layout er stabil og focus
          ikke hopper rundt. */}
      <button
        ref={næsteKnapRef}
        type={feedbackVist ? 'button' : 'submit'}
        onClick={feedbackVist ? gåVidere : undefined}
        disabled={!feedbackVist && !kanSubmitte}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md',
          'disabled:bg-slate-300 disabled:cursor-not-allowed',
        )}
      >
        {feedbackVist ? (
          <>
            {erSidste ? 'Se resultat' : 'Næste opgave'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        ) : (
          'Svar'
        )}
      </button>
    </>
  );
}

/** Formatér et tal med dansk decimal-tegn (komma). */
function formaterTal(n: number): string {
  return String(n).replace('.', ',');
}
