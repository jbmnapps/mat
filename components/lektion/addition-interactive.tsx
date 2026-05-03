'use client';

/**
 * Interaktiv lektion for addition.
 *
 * LAYOUT-PRINCIP: 3 absolut-positionerede slots der ikke påvirker hinanden.
 *  - Message slot: centeret i intro, glider op og forbliver der i aktiv mode.
 *  - Formula slot: fast position på skærmens midte. Indholdet morfer
 *    horisontal → vertikal når eleven trykker Enter på "vi stiller dem op",
 *    eller på broen når 67+78 skal omarrangeres.
 *  - Hint slot: fast position i bunden.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useKeyboardViewport } from '@/lib/use-keyboard-viewport';
import type { DisciplinId } from '@/lib/disciplines';

// ============================================================================
// Faser
// ============================================================================

type Fase =
  | 'intro-1'
  | 'vis-horisontal-1'
  | 'spørg-hvordan-1'
  | 'forklarer-omarranger-1'
  | 'spørg-enere-1'
  | 'spørg-tier-1'
  | 'fejr-1'
  | 'broen' // 67+78 vises horisontalt
  | 'broen-morph' // morfer til vertikal og auto-advancer
  | 'spørg-enere-2'
  | 'mente-undervisning' // 15 splitter i 1 (mente) + 5 (enere) samtidigt
  | 'spørg-tier-2'
  | 'fejr-2'
  | 'færdig';

const EKSEMPEL_2_FASER: Fase[] = [
  'broen',
  'broen-morph',
  'spørg-enere-2',
  'mente-undervisning',
  'spørg-tier-2',
  'fejr-2',
  'færdig',
];

// Faser hvor formula er vertikal. broen er stadig horisontal — broen-morph er
// hvor det morfer.
const VERTIKAL_FASER: Fase[] = [
  'spørg-enere-1',
  'spørg-tier-1',
  'fejr-1',
  'broen-morph',
  'spørg-enere-2',
  'mente-undervisning',
  'spørg-tier-2',
  'fejr-2',
  'færdig',
];

// Kanonisk rækkefølge — bruges af tilbage-navigation.
const ALLE_FASER: Fase[] = [
  'intro-1',
  'vis-horisontal-1',
  'spørg-hvordan-1',
  'forklarer-omarranger-1',
  'spørg-enere-1',
  'spørg-tier-1',
  'fejr-1',
  'broen',
  'broen-morph',
  'spørg-enere-2',
  'mente-undervisning',
  'spørg-tier-2',
  'fejr-2',
  'færdig',
];

interface Eksempel {
  id: string;
  top: [number, number];
  bund: [number, number];
  enereSvar: number;
  tierSvar: number;
  resultat: number[];
}

const EKSEMPEL_1: Eksempel = {
  id: 'ex1',
  top: [2, 4],
  bund: [5, 4],
  enereSvar: 8,
  tierSvar: 7,
  resultat: [7, 8],
};

const EKSEMPEL_2: Eksempel = {
  id: 'ex2',
  top: [6, 7],
  bund: [7, 8],
  enereSvar: 15,
  tierSvar: 14,
  resultat: [1, 4, 5],
};

// ============================================================================
// Beskeder
// ============================================================================

function beskedFor(fase: Fase, enereSvar2: 5 | 15 | null): string {
  switch (fase) {
    case 'intro-1':
    case 'vis-horisontal-1':
      return 'Her er et plusstykke.';
    case 'spørg-hvordan-1':
      return 'Hvordan regner vi det ud?';
    case 'forklarer-omarranger-1':
      return 'Vi stiller dem op under hinanden.';
    case 'spørg-enere-1':
      return 'Hvad er 4 + 4?';
    case 'spørg-tier-1':
      return 'Hvad er 2 + 5?';
    case 'fejr-1':
      return 'Flot. Det giver 78.';
    case 'broen':
    case 'broen-morph':
      return 'Hvad nu hvis tallene bliver større?';
    case 'spørg-enere-2':
      return 'Hvad er 7 + 8?';
    case 'mente-undervisning':
      return enereSvar2 === 5
        ? 'Du vidste det. 5 går her, og 1 flytter over til næste søjle.'
        : '15 har to cifre. Det er én tier og 5 enere — tieren flytter over.';
    case 'spørg-tier-2':
      return 'Hvad er 6 + 7 + 1?';
    case 'fejr-2':
      return 'Stærkt. Det giver 145.';
    case 'færdig':
      return 'Du har lært det.';
  }
}

// ============================================================================
// Hovedkomponent
// ============================================================================

interface Props {
  disciplinId: DisciplinId;
}

export function AdditionInteractive({ disciplinId }: Props) {
  const [fase, setFase] = useState<Fase>('intro-1');
  const [enereInput, setEnereInput] = useState('');
  const [tierInput, setTierInput] = useState('');
  const [enereGodkendt, setEnereGodkendt] = useState(false);
  const [tierGodkendt, setTierGodkendt] = useState(false);
  const [enereSvar2, setEnereSvar2] = useState<5 | 15 | null>(null);
  const [shake, setShake] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardViewport = useKeyboardViewport();

  const erIntro = fase === 'intro-1';
  const erEksempel2 = EKSEMPEL_2_FASER.includes(fase);
  const ex = erEksempel2 ? EKSEMPEL_2 : EKSEMPEL_1;
  const layout: 'horisontal' | 'vertikal' = VERTIKAL_FASER.includes(fase)
    ? 'vertikal'
    : 'horisontal';
  const visFormula = fase !== 'intro-1';

  // Reset state ved start af eksempel 2
  useEffect(() => {
    if (fase === 'broen') {
      setEnereInput('');
      setTierInput('');
      setEnereGodkendt(false);
      setTierGodkendt(false);
      setEnereSvar2(null);
    }
  }, [fase]);

  // Auto-fokus på input
  useEffect(() => {
    const inputFaser: Fase[] = [
      'spørg-enere-1',
      'spørg-tier-1',
      'spørg-enere-2',
      'spørg-tier-2',
    ];
    if (inputFaser.includes(fase)) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [fase]);

  // Auto-advance fra broen-morph (efter morph-animationen)
  useEffect(() => {
    if (fase === 'broen-morph') {
      const t = setTimeout(() => setFase('spørg-enere-2'), 800);
      return () => clearTimeout(t);
    }
  }, [fase]);

  // Avancering — bruges af både Enter-tast og touch/click-knap.
  // Returnerer true hvis fase blev avanceret, false hvis nuværende fase
  // ikke skal reagere (input-faser, auto-advance).
  const advance = useCallback((): boolean => {
    switch (fase) {
      case 'intro-1':
        setFase('vis-horisontal-1');
        return true;
      case 'vis-horisontal-1':
        setFase('spørg-hvordan-1');
        return true;
      case 'spørg-hvordan-1':
        setFase('forklarer-omarranger-1');
        return true;
      case 'forklarer-omarranger-1':
        setFase('spørg-enere-1');
        return true;
      case 'fejr-1':
        setFase('broen');
        return true;
      case 'broen':
        setFase('broen-morph');
        return true;
      case 'mente-undervisning':
        setFase('spørg-tier-2');
        return true;
      case 'fejr-2':
        setFase('færdig');
        return true;
      default:
        return false;
    }
  }, [fase]);

  // Tilbage-navigation (regel: eleven skal kunne navigere frem og tilbage).
  // Går én fase tilbage. State (input, godkendt-status) bevares — eleven
  // kan se hvor hun var. Frem håndteres via klik/Enter (advance).
  const forrigeFase = useCallback(() => {
    const idx = ALLE_FASER.indexOf(fase);
    if (idx > 0) setFase(ALLE_FASER[idx - 1]);
  }, [fase]);

  const erFørsteFase = ALLE_FASER.indexOf(fase) === 0;

  // Tastatur — Enter avancerer i ikke-input-faser, ArrowLeft går tilbage
  // (men ikke når fokus er på et input-felt; der skal pilene flytte cursor).
  useEffect(() => {
    const inputFaser: Fase[] = [
      'spørg-enere-1',
      'spørg-tier-1',
      'spørg-enere-2',
      'spørg-tier-2',
    ];
    const erIInputFase = inputFaser.includes(fase) || fase === 'broen-morph';

    const handler = (e: KeyboardEvent) => {
      const erIInputFelt = e.target instanceof HTMLInputElement;

      // Tilbage virker altid (undtagen når cursor er i input — der skal pilen
      // flytte cursor i tal-feltet).
      if (e.key === 'ArrowLeft' && !erIInputFelt) {
        e.preventDefault();
        forrigeFase();
        return;
      }

      // Enter avancerer kun i ikke-input-faser. I input-faser submitter
      // input-formen Enter selv.
      if (e.key === 'Enter' && !erIInputFase) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fase, advance, forrigeFase]);

  const fail = useCallback(() => {
    setShake(true);
    setEnereInput('');
    setTierInput('');
    setTimeout(() => setShake(false), 400);
  }, []);

  const submitEnere = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(enereInput);
    if (fase === 'spørg-enere-1') {
      if (num === ex.enereSvar) {
        setEnereGodkendt(true);
        setTimeout(() => setFase('spørg-tier-1'), 450);
      } else fail();
    } else if (fase === 'spørg-enere-2') {
      // Accepter både 5 (eleven kender mente) og 15 (eleven har regnet det rå)
      if (num === 15 || num === 5) {
        setEnereSvar2(num as 5 | 15);
        setTimeout(() => setFase('mente-undervisning'), 300);
      } else fail();
    }
  };

  const submitTier = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tierInput);
    if (fase === 'spørg-tier-1') {
      if (num === ex.tierSvar) {
        setTierGodkendt(true);
        setTimeout(() => setFase('fejr-1'), 450);
      } else fail();
    } else if (fase === 'spørg-tier-2') {
      if (num === 14) {
        setTierGodkendt(true);
        setTimeout(() => setFase('fejr-2'), 450);
      } else fail();
    }
  };

  const beskedTekst = beskedFor(fase, enereSvar2);

  // Klik-overalt-avancerer (regel: klik avancerer overalt — Tjek-knap kun
  // ved flere mulige handlinger). I input-faser returnerer advance() false,
  // så klik gør intet — eleven kan trygt klikke i input-feltet uden at
  // springe videre. Klik på input/knap/link/form ignoreres så native
  // adfærd virker (cursor-placering, navigation, submit).
  const handleScreenClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, button, a, form, label')) return;
    advance();
  };

  return (
    <main
      className="h-[100dvh] relative bg-slate-50/40 overflow-hidden cursor-pointer"
      style={keyboardViewport.height ? { height: `${keyboardViewport.height}px` } : undefined}
      onClick={handleScreenClick}
    >
      {/* Header */}
      <header
        className={cn(
          'absolute top-0 left-0 right-0 px-6 lg:px-12 z-10 flex items-center justify-between gap-4',
          keyboardViewport.keyboardOpen ? 'safe-top pb-2' : 'safe-top-roomy pb-5 lg:pb-7',
        )}
      >
        <Link
          href={`/${disciplinId}/`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Afslut lektion
        </Link>

        {/* Tilbage-knap til forrige fase — vises altid undtagen i første fase */}
        <button
          type="button"
          onClick={forrigeFase}
          disabled={erFørsteFase}
          aria-label="Tilbage til forrige trin"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500',
            'transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        </button>
      </header>

      {/* MESSAGE SLOT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 text-center w-full max-w-2xl pointer-events-none z-[5]">
        <motion.div
          initial={false}
          animate={{ y: erIntro ? 0 : keyboardViewport.keyboardOpen ? -150 : -220 }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <motion.div
            initial={false}
            animate={{
              fontSize: erIntro
                ? 'clamp(26px, 7vw, 40px)'
                : 'clamp(18px, 5vw, 26px)',
            }}
            transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
            className="font-display font-bold tracking-tight text-slate-900 leading-snug"
          >
            {/* mode="popLayout" lader gammel exit'e samtidigt med at ny
                initial fade'er ind — krydsfade. Tidligere "wait" gav en
                blank periode mellem beskeder hvor eleven sad uden kontekst. */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={beskedTekst}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {beskedTekst}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* FORMULA SLOT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3]">
        <AnimatePresence>
          {visFormula && (
            <motion.div
              key="formula-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: shake ? [-6, 6, -6, 6, 0] : 0 }}
              exit={{ opacity: 0 }}
              transition={shake ? { duration: 0.4 } : { duration: 0.4, delay: 0.4 }}
            >
              <FormulaScene
                ex={ex}
                layout={layout}
                fase={fase}
                enereInput={enereInput}
                setEnereInput={setEnereInput}
                tierInput={tierInput}
                setTierInput={setTierInput}
                enereGodkendt={enereGodkendt}
                tierGodkendt={tierGodkendt}
                submitEnere={submitEnere}
                submitTier={submitTier}
                inputRef={inputRef}
                erEksempel2={erEksempel2}
                kompakt={keyboardViewport.keyboardOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HINT SLOT */}
      <div className="absolute bottom-[12vh] left-1/2 -translate-x-1/2 px-6 text-center pointer-events-auto z-[5]">
        <Hint fase={fase} disciplinId={disciplinId} advance={advance} />
      </div>
    </main>
  );
}

// ============================================================================
// FormulaScene
// ============================================================================

interface FormulaSceneProps {
  ex: Eksempel;
  layout: 'horisontal' | 'vertikal';
  fase: Fase;
  enereInput: string;
  setEnereInput: (s: string) => void;
  tierInput: string;
  setTierInput: (s: string) => void;
  enereGodkendt: boolean;
  tierGodkendt: boolean;
  submitEnere: (e: React.FormEvent) => void;
  submitTier: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  erEksempel2: boolean;
  kompakt: boolean;
}

const POS: Record<'horisontal' | 'vertikal', Record<string, { col: number; row: number }>> = {
  horisontal: {
    t0: { col: 1, row: 3 },
    t1: { col: 2, row: 3 },
    op: { col: 3, row: 3 },
    b0: { col: 4, row: 3 },
    b1: { col: 5, row: 3 },
  },
  vertikal: {
    t0: { col: 3, row: 2 },
    t1: { col: 4, row: 2 },
    op: { col: 2, row: 3 },
    b0: { col: 3, row: 3 },
    b1: { col: 4, row: 3 },
  },
};

function FormulaScene(props: FormulaSceneProps) {
  const {
    ex,
    layout,
    fase,
    enereInput,
    setEnereInput,
    tierInput,
    setTierInput,
    enereGodkendt,
    tierGodkendt,
    submitEnere,
    submitTier,
    inputRef,
    erEksempel2,
    kompakt,
  } = props;

  const erVertikal = layout === 'vertikal';

  const aktivKolonne: 'enere' | 'tier' | null =
    fase === 'spørg-enere-1' || fase === 'spørg-enere-2'
      ? 'enere'
      : fase === 'spørg-tier-1' || fase === 'spørg-tier-2'
        ? 'tier'
        : null;

  const erAktivtCiffer = (id: string) => {
    if (aktivKolonne === 'enere') return id === 't1' || id === 'b1';
    if (aktivKolonne === 'tier') return id === 't0' || id === 'b0';
    return false;
  };

  // Mente-1 vises FRA mente-undervisning og frem (ikke længere først ved mente-anim)
  const visMente =
    erEksempel2 &&
    (fase === 'mente-undervisning' ||
      fase === 'spørg-tier-2' ||
      fase === 'fejr-2' ||
      fase === 'færdig');

  const harHundrede = ex.resultat.length === 3;
  // Enere-resultatet "5" vises FRA mente-undervisning (samtidigt med mente-1)
  const visEnereResultatCiffer =
    erEksempel2 &&
    (fase === 'mente-undervisning' ||
      fase === 'spørg-tier-2' ||
      fase === 'fejr-2' ||
      fase === 'færdig')
      ? '5'
      : null;

  const elementer = [
    { id: 't0', value: String(ex.top[0]) },
    { id: 't1', value: String(ex.top[1]) },
    { id: 'op', value: '+' },
    { id: 'b0', value: String(ex.bund[0]) },
    { id: 'b1', value: String(ex.bund[1]) },
  ];

  return (
    <div
      className="grid"
      style={{
        // Responsiv kolonne-bredde: 44px på smalle skærme, op til 60px desktop
        gridTemplateColumns: kompakt
          ? 'repeat(5, clamp(38px, 11vw, 54px))'
          : 'repeat(5, clamp(44px, 13vw, 60px))',
        // Responsive rækker — første og sidste skalerer med viewport
        gridTemplateRows: kompakt
          ? 'clamp(24px, 4vw, 32px) clamp(48px, 12vw, 68px) clamp(48px, 12vw, 68px) 8px clamp(48px, 12vw, 68px)'
          : 'clamp(28px, 5vw, 36px) clamp(56px, 14vw, 76px) clamp(56px, 14vw, 76px) 8px clamp(56px, 14vw, 76px)',
        placeItems: 'center',
      }}
    >
      {/* Morfende cifre */}
      {elementer.map((el) => {
        const pos = POS[layout][el.id];
        const erOperator = el.id === 'op';
        const aktiv = erAktivtCiffer(el.id);
        return (
          <motion.span
            key={`${ex.id}-${el.id}`}
            layout
            transition={{ layout: { duration: 0.7, ease: [0.4, 0.0, 0.2, 1] } }}
            style={{ gridColumn: pos.col, gridRow: pos.row }}
            className={cn(
              'font-display sm:text-6xl lg:text-7xl font-bold tabular-nums select-none transition-colors duration-300',
              kompakt ? 'text-3xl' : 'text-4xl',
              erOperator ? 'text-emerald-600' : aktiv ? 'text-emerald-600' : 'text-slate-900',
            )}
          >
            {el.value}
          </motion.span>
        );
      })}

      {/* Mente — over tier-søjlen i vertikal (col 3) */}
      <AnimatePresence>
        {visMente && (
          <motion.span
            key="mente"
            initial={{ opacity: 0, y: 30, scale: 0.4 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 18,
            }}
            style={{ gridColumn: 3, gridRow: 1 }}
            className="font-display text-3xl font-bold tabular-nums text-emerald-600"
          >
            1
          </motion.span>
        )}
      </AnimatePresence>

      {/* Streg */}
      <AnimatePresence>
        {erVertikal && (
          <motion.div
            key="line"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            style={{ gridColumn: '3 / span 2', gridRow: 4 }}
            className="bg-slate-900 h-[3px] w-full origin-left rounded-full"
          />
        )}
      </AnimatePresence>

      {/* Resultat-række */}
      {erVertikal && (
        <>
          {/* Hundrede (col 2 — kun ex2 efter tier-svar). Render ALDRIG ved
              !harHundrede — ellers viser den en placeholder-streg på en
              kolonne der ikke skal udfyldes (regel: layout må aldrig
              hint at noget skal udfyldes der ikke skal). */}
          {harHundrede && (
            <ResultCell
              col={2}
              row={5}
              value={(fase === 'fejr-2' || fase === 'færdig') ? '1' : null}
              variant="static"
            />
          )}

          {/* Tier (col 3) */}
          <ResultCell
            col={3}
            row={5}
            value={tierGodkendt ? String(erEksempel2 ? ex.resultat[1] : ex.resultat[0]) : null}
            variant={aktivKolonne === 'tier' ? 'input' : 'static'}
            isFinal={tierGodkendt}
            inputProps={
              aktivKolonne === 'tier'
                ? {
                    value: tierInput,
                    onChange: setTierInput,
                    onSubmit: submitTier,
                    ref: inputRef,
                    kompakt,
                  }
                : undefined
            }
          />

          {/* Enere (col 4) */}
          <ResultCell
            col={4}
            row={5}
            value={enereGodkendt ? String(ex.resultat[ex.resultat.length - 1]) : visEnereResultatCiffer}
            variant={aktivKolonne === 'enere' ? 'input' : 'static'}
            isFinal={enereGodkendt || visEnereResultatCiffer !== null}
            inputProps={
              aktivKolonne === 'enere'
                ? {
                    value: enereInput,
                    onChange: setEnereInput,
                    onSubmit: submitEnere,
                    ref: inputRef,
                    kompakt,
                  }
                : undefined
            }
          />
        </>
      )}
    </div>
  );
}

// ============================================================================
// ResultCell — én celle i resultat-rækken
// Cellen er 60×76. Bunden af både input-border og placeholder-streg ligger
// præcis 4px over cell-bottom, så de tre celler er aligned vandret.
// ============================================================================

interface ResultCellProps {
  col: number;
  row: number;
  value: string | null;
  variant: 'input' | 'static';
  isFinal?: boolean;
  inputProps?: {
    value: string;
    onChange: (s: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    ref: React.RefObject<HTMLInputElement | null>;
    kompakt: boolean;
  };
}

function ResultCell({ col, row, value, variant, isFinal, inputProps }: ResultCellProps) {
  return (
    <div
      style={{ gridColumn: col, gridRow: row }}
      className="flex items-end justify-center w-full h-full"
    >
      {/* Tom placeholder-streg fjernet bevidst (regel: layout må aldrig hint
          udfyldning). Tomme statiske celler er bare tomme. Input-celler har
          deres egen border via input-feltet. */}

      {variant === 'static' && value && (
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className={cn(
            'font-display text-4xl sm:text-6xl lg:text-7xl font-bold tabular-nums leading-none mb-1',
            isFinal ? 'text-emerald-600' : 'text-slate-900',
          )}
        >
          {value}
        </motion.span>
      )}

      {variant === 'input' && inputProps && (
        <form onSubmit={inputProps.onSubmit} className="leading-none mb-1 relative">
          <input
            ref={inputProps.ref}
            type="text"
            inputMode="numeric"
            enterKeyHint="done"
            value={inputProps.value}
            onChange={(e) => inputProps.onChange(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={2}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Indtast resultat"
            className={cn(
              // Bredt nok til 2 cifre — overflower lidt celle-bredden, fint
              inputProps.kompakt
                ? 'w-[52px] h-[40px] sm:w-[80px] sm:h-[63px]'
                : 'w-[60px] h-[44px] sm:w-[80px] sm:h-[63px]',
              'box-border p-0',
              // Tekst
              'font-display sm:text-6xl lg:text-7xl font-bold tabular-nums text-center',
              inputProps.kompakt
                ? 'text-3xl leading-[36px] sm:leading-[60px]'
                : 'text-4xl leading-[40px] sm:leading-[60px]',
              'text-slate-900 bg-transparent',
              // Streg
              'border-b-2 border-slate-900',
              'focus:outline-none focus:border-emerald-600',
              // Caret
              'caret-emerald-600',
            )}
          />

          {/* Eksplicit submit-knap. iOS numeric keypad har ingen "Go"-tast,
              så uden denne knap kan eleven ikke godkende sit svar.
              Skjult på desktop hvor Enter virker. */}
          <button
            type="submit"
            disabled={inputProps.value.trim() === ''}
            aria-label="Tjek svar"
            className={cn(
              'sm:hidden absolute left-1/2 -translate-x-1/2',
              inputProps.kompakt ? '-bottom-10' : '-bottom-12',
              'inline-flex items-center justify-center whitespace-nowrap',
              'rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-sm',
              'disabled:bg-slate-300 disabled:cursor-not-allowed',
            )}
          >
            Tjek
          </button>
        </form>
      )}
    </div>
  );
}

// ============================================================================
// Hint
// ============================================================================

function Hint({
  fase,
  disciplinId,
  advance,
}: {
  fase: Fase;
  disciplinId: DisciplinId;
  advance: () => boolean;
}) {
  const enterFaser: Fase[] = [
    'intro-1',
    'vis-horisontal-1',
    'spørg-hvordan-1',
    'forklarer-omarranger-1',
    'fejr-1',
    'broen',
    'mente-undervisning',
    'fejr-2',
  ];

  if (enterFaser.includes(fase)) {
    return (
      <motion.button
        key="enter-hint"
        type="button"
        onClick={advance}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-400 hover:text-slate-700 transition-colors px-4 py-3 -mx-4 -my-3"
      >
        <span className="hidden sm:inline">
          Tryk{' '}
          <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 mx-1 rounded border border-slate-300 bg-white text-[11px] font-mono">
            Enter
          </kbd>{' '}
          for at gå videre
        </span>
        <span className="sm:hidden">Tryk her for at gå videre</span>
      </motion.button>
    );
  }

  if (fase === 'færdig') {
    return (
      <motion.div
        key="færdig-cta"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link
          href={`/${disciplinId}/traening/`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-md"
        >
          Start træning
        </Link>
        <Link
          href={`/${disciplinId}/`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          Tilbage til addition
        </Link>
      </motion.div>
    );
  }

  return null;
}
