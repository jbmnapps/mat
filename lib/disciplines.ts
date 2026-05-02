/**
 * Master-listen af FP9-diciplinerne.
 *
 * Kategorier følger FP9-pensum:
 *  - tal-og-algebra
 *  - geometri
 *  - statistik
 *
 * Hver disciplin har et stabilt id (bruges som localStorage-nøgle og URL-segment),
 * et symbol (vises i dashboard-kort), og en farve (matcher print-projektets palette
 * for de fire regnearter; andre disciplinerne får en neutral grå indtil vi vælger).
 */

export type DisciplinId =
  | 'addition'
  | 'subtraktion'
  | 'multiplikation'
  | 'division'
  | 'decimaltal'
  | 'procent'
  | 'ligninger'
  | 'regneudtryk'
  | 'overslagsregning'
  | 'hverdagsregning'
  | 'enhedsomregning'
  | 'vinkler'
  | 'koordinatsystem'
  | 'rumfang'
  | 'ligedannethed'
  | 'diagrammer'
  | 'tabeller'
  | 'sandsynlighed';

export type Kategori = 'tal-og-algebra' | 'geometri' | 'statistik';

export type Status = 'untouched' | 'rod' | 'gul' | 'gron';

export interface Disciplin {
  id: DisciplinId;
  navn: string;
  symbol: string;
  kategori: Kategori;
  /** Tailwind-farve-key (ref. tailwind.config.ts). undefined = neutral grå. */
  farve?: 'add' | 'sub' | 'mul' | 'div';
  /** Kort beskrivelse til tooltip og disciplin-side */
  beskrivelse: string;
}

export const DISCIPLINER: Disciplin[] = [
  // — Tal og algebra
  {
    id: 'addition',
    navn: 'Addition',
    symbol: '+',
    kategori: 'tal-og-algebra',
    farve: 'add',
    beskrivelse: 'Læg sammen på papir',
  },
  {
    id: 'subtraktion',
    navn: 'Subtraktion',
    symbol: '−',
    kategori: 'tal-og-algebra',
    farve: 'sub',
    beskrivelse: 'Træk fra på papir',
  },
  {
    id: 'multiplikation',
    navn: 'Multiplikation',
    symbol: '·',
    kategori: 'tal-og-algebra',
    farve: 'mul',
    beskrivelse: 'Gang to eller flere tal',
  },
  {
    id: 'division',
    navn: 'Division',
    symbol: ':',
    kategori: 'tal-og-algebra',
    farve: 'div',
    beskrivelse: 'Dividér og lang division',
  },
  {
    id: 'decimaltal',
    navn: 'Decimaltal',
    symbol: ',',
    kategori: 'tal-og-algebra',
    beskrivelse: 'Regn med komma-tal',
  },
  {
    id: 'procent',
    navn: 'Procent og brøk',
    symbol: '%',
    kategori: 'tal-og-algebra',
    beskrivelse: 'Procent, brøker og decimaler',
  },
  {
    id: 'ligninger',
    navn: 'Ligninger',
    symbol: '=',
    kategori: 'tal-og-algebra',
    beskrivelse: 'Find x',
  },
  {
    id: 'regneudtryk',
    navn: 'Regneudtryk',
    symbol: '?',
    kategori: 'tal-og-algebra',
    beskrivelse: 'Indsæt tal så udtryk bliver sande',
  },
  {
    id: 'overslagsregning',
    navn: 'Overslagsregning',
    symbol: '≈',
    kategori: 'tal-og-algebra',
    beskrivelse: 'Vurdér størrelsesorden',
  },
  {
    id: 'hverdagsregning',
    navn: 'Hverdagsregning',
    symbol: 'kr',
    kategori: 'tal-og-algebra',
    beskrivelse: 'Priser, rabat, mængder',
  },

  // — Geometri og måling
  {
    id: 'enhedsomregning',
    navn: 'Enhedsomregning',
    symbol: 'cm',
    kategori: 'geometri',
    beskrivelse: 'm ↔ km, cm ↔ mm, dL ↔ mL',
  },
  {
    id: 'vinkler',
    navn: 'Vinkler',
    symbol: '°',
    kategori: 'geometri',
    beskrivelse: 'Beregn ukendte vinkler',
  },
  {
    id: 'koordinatsystem',
    navn: 'Koordinatsystem',
    symbol: '·',
    kategori: 'geometri',
    beskrivelse: 'Aflæs punkter, find ligning',
  },
  {
    id: 'rumfang',
    navn: 'Rumfang og areal',
    symbol: 'V',
    kategori: 'geometri',
    beskrivelse: 'V = G · h, areal af grundflade',
  },
  {
    id: 'ligedannethed',
    navn: 'Ligedannethed',
    symbol: '~',
    kategori: 'geometri',
    beskrivelse: 'Forholdstal, areal-faktor',
  },

  // — Statistik og sandsynlighed
  {
    id: 'diagrammer',
    navn: 'Diagrammer',
    symbol: '▮',
    kategori: 'statistik',
    beskrivelse: 'Aflæs søjle- og linjediagrammer',
  },
  {
    id: 'tabeller',
    navn: 'Tabeller og gennemsnit',
    symbol: '⊞',
    kategori: 'statistik',
    beskrivelse: 'Frekvens og gennemsnit',
  },
  {
    id: 'sandsynlighed',
    navn: 'Sandsynlighed',
    symbol: 'P',
    kategori: 'statistik',
    beskrivelse: 'Mønter, terninger, kombinatorik',
  },
];

export const KATEGORI_NAVNE: Record<Kategori, string> = {
  'tal-og-algebra': 'Tal og algebra',
  geometri: 'Geometri og måling',
  statistik: 'Statistik og sandsynlighed',
};

/** Slå en disciplin op pr. id. Throws hvis ikke fundet. */
export function getDisciplin(id: DisciplinId): Disciplin {
  const d = DISCIPLINER.find((d) => d.id === id);
  if (!d) throw new Error(`Disciplin ikke fundet: ${id}`);
  return d;
}

/**
 * Farve-palette pr. disciplin.
 * Bg er pastel (Tailwind -100), tekst er mættet (Tailwind -600).
 * De fire regnearter (add/sub/mul/div) bevarer print-projektets DNA.
 * De øvrige er valgt så hver disciplin er visuelt identificerbar uden at
 * gridet bliver garish.
 */
export const DISCIPLIN_FARVE: Record<DisciplinId, { tekst: string; bg: string }> = {
  // Regnearter (print-DNA)
  addition: { tekst: 'text-emerald-600', bg: 'bg-emerald-100' },
  subtraktion: { tekst: 'text-rose-600', bg: 'bg-rose-100' },
  multiplikation: { tekst: 'text-violet-600', bg: 'bg-violet-100' },
  division: { tekst: 'text-amber-600', bg: 'bg-amber-100' },
  // Resten af tal-og-algebra
  decimaltal: { tekst: 'text-cyan-600', bg: 'bg-cyan-100' },
  procent: { tekst: 'text-pink-600', bg: 'bg-pink-100' },
  ligninger: { tekst: 'text-indigo-600', bg: 'bg-indigo-100' },
  regneudtryk: { tekst: 'text-lime-600', bg: 'bg-lime-100' },
  overslagsregning: { tekst: 'text-sky-600', bg: 'bg-sky-100' },
  hverdagsregning: { tekst: 'text-yellow-600', bg: 'bg-yellow-100' },
  // Geometri
  enhedsomregning: { tekst: 'text-teal-600', bg: 'bg-teal-100' },
  vinkler: { tekst: 'text-orange-600', bg: 'bg-orange-100' },
  koordinatsystem: { tekst: 'text-blue-600', bg: 'bg-blue-100' },
  rumfang: { tekst: 'text-purple-600', bg: 'bg-purple-100' },
  ligedannethed: { tekst: 'text-fuchsia-600', bg: 'bg-fuchsia-100' },
  // Statistik
  tabeller: { tekst: 'text-slate-600', bg: 'bg-slate-200' },
  diagrammer: { tekst: 'text-green-600', bg: 'bg-green-100' },
  sandsynlighed: { tekst: 'text-red-600', bg: 'bg-red-100' },
};

/**
 * Beregn status fra en prøveklar-score.
 *  <50%: rod
 *  50-79%: gul
 *  ≥80%: gron
 */
export function statusFraScore(score: number): Status {
  if (score >= 80) return 'gron';
  if (score >= 50) return 'gul';
  return 'rod';
}
