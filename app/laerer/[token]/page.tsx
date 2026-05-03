'use client';

/**
 * Lærer-dashboard — på /laerer/<token>/.
 *
 * Layout:
 *  - Header med "Lærer" badge + log-ud-knap
 *  - Liste over alle elever med:
 *      - Navn, sidst aktiv ("for 5 min siden")
 *      - Mini-grid med status-prik pr. disciplin
 *      - Antal grøn / gul / rød / ikke-startet
 *  - Klik på elev → udvid for at se detaljer
 *
 * Sikkerhed:
 *  - Token tjekkes både client-side (komponent) og baked-in (generateStaticParams).
 *  - Ved login: vi bruger lærer-kontoen (laerer@fp9.local) hvor RLS-policies
 *    tillader læs af alle elev-rækker via is_teacher().
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Loader2,
  LogOut,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import {
  logIndSomLaerer,
  logUd,
  hentAlleEleverForLaerer,
  nulstilElevProgress,
  type ElevOversigt,
} from '@/lib/auth';
import { supabaseEnabled } from '@/lib/supabase-client';
import { DISCIPLINER, KATEGORI_NAVNE, type Kategori } from '@/lib/disciplines';
import { cn } from '@/lib/utils';

/** Antal sekunder hvor en elev tæller som "aktiv lige nu". */
const AKTIV_LIVE_SEK = 120;
/** Hvor ofte vi auto-refresh'er elev-listen. */
const AUTO_REFRESH_MS = 30_000;
/** Supabase project-ID — bruges til at linke til Auth-dashboard for kode-reset. */
const SUPABASE_PROJECT = 'jkfxirpqhdettipixunl';

export default function LaererPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;
  const [tilstand, setTilstand] = useState<
    'tjekker' | 'forkert-link' | 'logger-ind' | 'fejl' | 'klar'
  >('tjekker');
  const [fejlBesked, setFejlBesked] = useState<string | null>(null);
  const [elever, setElever] = useState<ElevOversigt[]>([]);
  const [henter, setHenter] = useState(false);
  const [udvidet, setUdvidet] = useState<Set<string>>(new Set());

  const disciplinerEfterKategori = useMemo(() => {
    const grupper: Record<Kategori, typeof DISCIPLINER> = {
      'tal-og-algebra': [],
      geometri: [],
      statistik: [],
    };
    for (const d of DISCIPLINER) grupper[d.kategori].push(d);
    return grupper;
  }, []);

  useEffect(() => {
    if (!supabaseEnabled) {
      setTilstand('forkert-link');
      setFejlBesked('Backend er ikke konfigureret.');
      return;
    }

    setTilstand('logger-ind');
    logIndSomLaerer(token).then((res) => {
      if (!res.ok) {
        setTilstand('forkert-link');
        setFejlBesked(res.fejl);
        return;
      }
      hentEleverNu();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-refresh elev-listen så live-aktivitet er ægte tæt på real-time
  useEffect(() => {
    if (tilstand !== 'klar') return;
    const id = setInterval(() => {
      hentEleverNu();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tilstand]);

  // Tick hvert 10. sekund så "aktiv nu" / "for 2 min siden" opdaterer
  // mellem refreshes uden at skulle fetche nyt data
  const [, setTick] = useState(0);
  useEffect(() => {
    if (tilstand !== 'klar') return;
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, [tilstand]);

  async function hentEleverNu() {
    setHenter(true);
    try {
      const data = await hentAlleEleverForLaerer();
      setElever(data);
      setTilstand('klar');
    } catch (e) {
      console.error(e);
      setTilstand('fejl');
      setFejlBesked('Kunne ikke hente elev-data.');
    } finally {
      setHenter(false);
    }
  }

  async function bekraeftNulstil(elev: ElevOversigt) {
    const ok = window.confirm(
      `Slet alle scores for ${elev.visningsnavn}?\n\nKontoen og koden bevares — kun progress nulstilles. Kan ikke fortrydes.`,
    );
    if (!ok) return;
    const res = await nulstilElevProgress(elev.brugerId);
    if (!res.ok) {
      alert(`Kunne ikke nulstille: ${res.fejl}`);
      return;
    }
    await hentEleverNu();
  }

  async function håndterLogUd() {
    await logUd();
    router.replace('/laerer/');
  }

  function toggleUdvidet(id: string) {
    setUdvidet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Tilstand: tjekker / logger ind
  if (tilstand === 'tjekker' || tilstand === 'logger-ind') {
    return (
      <main className="min-h-[100dvh] bg-slate-50/40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-3" aria-label="Indlæser" />
          <p className="text-sm text-slate-500">Logger ind som lærer…</p>
        </div>
      </main>
    );
  }

  // Tilstand: forkert link / fejl
  if (tilstand === 'forkert-link' || tilstand === 'fejl') {
    return (
      <main className="min-h-[100dvh] bg-slate-50/40 flex flex-col">
        <header className="px-6 py-6">
          <Link
            href="/laerer/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Til lærer-login
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-6 -mt-12">
          <div className="text-center max-w-md">
            <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-4" aria-hidden />
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 mb-2">
              {tilstand === 'forkert-link' ? 'Forkert link' : 'Noget gik galt'}
            </h1>
            <p className="text-slate-600 text-sm">{fejlBesked}</p>
          </div>
        </div>
      </main>
    );
  }

  // Tilstand: klar
  return (
    <main className="min-h-[100dvh] bg-slate-50/40">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12 lg:px-12 lg:py-16">
        {/* HEADER */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Lærer-oversigt
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              {elever.length} {elever.length === 1 ? 'elev' : 'elever'}
            </h1>
            <p className="mt-1 text-sm text-slate-600 italic font-serif">
              Sorteret efter sidst aktive først.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={hentEleverNu}
              disabled={henter}
              title="Opdatér"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('h-4 w-4', henter && 'animate-spin')} aria-hidden />
            </button>
            <button
              type="button"
              onClick={håndterLogUd}
              title="Log ud af lærer-konto"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 h-9 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Log ud
            </button>
          </div>
        </header>

        {/* TOM TILSTAND */}
        {elever.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-slate-700 mb-1">
              Ingen elever endnu
            </p>
            <p className="text-sm text-slate-500">
              Når en elev logger ind for første gang, dukker de op her.
            </p>
          </div>
        )}

        {/* ELEV-LISTE */}
        <div className="space-y-3">
          {elever.map((elev) => {
            const erUdvidet = udvidet.has(elev.brugerId);
            const sammentælling = tælStatus(elev);

            return (
              <motion.div
                key={elev.brugerId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleUdvidet(elev.brugerId)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-display text-lg font-bold text-slate-900">
                        {elev.visningsnavn}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {elev.navnSlug}
                      </span>
                    </div>
                    <SidstAktivLinje
                      sidstAktiv={elev.sidstAktiv}
                      totalAktivSek={elev.totalAktivSek}
                    />
                  </div>

                  <div className="hidden sm:flex items-center gap-3 text-xs">
                    <StatusPill antal={sammentælling.gron} farve="bg-status-gron" tekst="grøn" />
                    <StatusPill antal={sammentælling.gul} farve="bg-status-gul" tekst="gul" />
                    <StatusPill antal={sammentælling.rod} farve="bg-status-rod" tekst="rød" />
                    <StatusPill antal={sammentælling.utouchet} farve="bg-slate-300" tekst="ikke" />
                  </div>
                </button>

                {erUdvidet && (
                  <div className="border-t border-slate-200 bg-slate-50/40 px-5 py-4">
                    {/* Lærer-handlinger — flyttet til toppen så de er synlige med det samme */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => bekraeftNulstil(elev)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        Nulstil progress
                      </button>
                      <a
                        href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/auth/users?filter=${encodeURIComponent(`${elev.navnSlug}@elev.fp9.local`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900 transition-colors"
                        title="Åbner Supabase-dashboard hvor du kan resette koden"
                      >
                        <KeyRound className="h-3.5 w-3.5" aria-hidden />
                        Reset kode
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    </div>

                    {(Object.keys(disciplinerEfterKategori) as Kategori[]).map((kat) => (
                      <div key={kat} className="mb-4 last:mb-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                          {KATEGORI_NAVNE[kat]}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {disciplinerEfterKategori[kat].map((d) => {
                            const p = elev.progress[d.id];
                            return (
                              <div
                                key={d.id}
                                title={`${d.navn}: ${tekstForStatus(p.status)} (${p.bedsteScore}%)`}
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs',
                                  p.status === 'gron' && 'bg-status-gron/10 text-status-gron',
                                  p.status === 'gul' && 'bg-status-gul/10 text-status-gul',
                                  p.status === 'rod' && 'bg-status-rod/10 text-status-rod',
                                  p.status === 'untouched' && 'bg-slate-100 text-slate-400',
                                )}
                              >
                                <span
                                  className={cn(
                                    'h-1.5 w-1.5 rounded-full',
                                    p.status === 'gron' && 'bg-status-gron',
                                    p.status === 'gul' && 'bg-status-gul',
                                    p.status === 'rod' && 'bg-status-rod',
                                    p.status === 'untouched' && 'bg-slate-300',
                                  )}
                                  aria-hidden
                                />
                                <span className="font-semibold">{d.navn}</span>
                                {p.status !== 'untouched' && (
                                  <span className="tabular-nums">{p.bedsteScore}%</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function StatusPill({
  antal,
  farve,
  tekst,
}: {
  antal: number;
  farve: string;
  tekst: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-slate-700">
      <span className={cn('h-2 w-2 rounded-full', farve)} aria-hidden />
      <span className="tabular-nums font-semibold">{antal}</span>
      <span className="text-slate-500">{tekst}</span>
    </span>
  );
}

function tælStatus(elev: ElevOversigt) {
  let gron = 0, gul = 0, rod = 0, utouchet = 0;
  for (const d of DISCIPLINER) {
    switch (elev.progress[d.id].status) {
      case 'gron': gron++; break;
      case 'gul': gul++; break;
      case 'rod': rod++; break;
      default: utouchet++;
    }
  }
  return { gron, gul, rod, utouchet };
}

function tekstForStatus(status: 'untouched' | 'rod' | 'gul' | 'gron'): string {
  return {
    untouched: 'Ikke startet',
    rod: 'Rød — under 50%',
    gul: 'Gul — 50–79%',
    gron: 'Grøn — 80%+',
  }[status];
}

function tidsForskel(iso: string): string {
  const nu = Date.now();
  const da = new Date(iso).getTime();
  const sek = Math.floor((nu - da) / 1000);
  if (sek < 60) return 'lige nu';
  const min = Math.floor(sek / 60);
  if (min < 60) return `for ${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `for ${t} ${t === 1 ? 'time' : 'timer'} siden`;
  const dage = Math.floor(t / 24);
  return `for ${dage} ${dage === 1 ? 'dag' : 'dage'} siden`;
}

/**
 * Viser "Aktiv nu" med pulserende grøn prik hvis eleven har sat
 * progress for under AKTIV_LIVE_SEK siden, ellers normal "for X min siden".
 * Plus total aktiv tid hvis > 0.
 */
function SidstAktivLinje({
  sidstAktiv,
  totalAktivSek,
}: {
  sidstAktiv: string;
  totalAktivSek: number;
}) {
  const sek = Math.floor((Date.now() - new Date(sidstAktiv).getTime()) / 1000);
  const erAktiv = sek < AKTIV_LIVE_SEK;
  const harAktivTid = totalAktivSek > 30;

  return (
    <p className="mt-0.5 inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
      {erAktiv ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-gron opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-gron" />
          </span>
          <span className="font-semibold text-status-gron">Aktiv nu</span>
        </span>
      ) : (
        <span className="text-slate-500">Sidst aktiv {tidsForskel(sidstAktiv)}</span>
      )}
      {harAktivTid && (
        <span className="text-slate-400">
          · trænet {formatVarighed(totalAktivSek)} i alt
        </span>
      )}
    </p>
  );
}

/**
 * Format en varighed i sekunder som "Xt Ymin" eller "X min" eller "X sek".
 * Til menneske-læsning på dashboards.
 */
function formatVarighed(sek: number): string {
  if (sek < 60) return `${sek} sek`;
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min} min`;
  const t = Math.floor(min / 60);
  const restMin = min % 60;
  if (restMin === 0) return `${t}t`;
  return `${t}t ${restMin}min`;
}
