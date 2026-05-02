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
