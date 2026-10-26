/**
 * Filterlogik für Entdecken, Startseite und Projekt-Finder.
 * Innerhalb einer Facette ODER, zwischen Facetten UND.
 * Der Filterzustand steht in der URL (teilbar), Werte als lesbare Kürzel:
 *   /entdecken/?nutzungsart=wohnen&foerderung=ja&kosten=0-3&q=gotha
 */
import { slugify } from './slug';
import {
  EINWOHNERZAHL,
  GESAMTKOSTEN,
  KATEGORIE,
  LEERSTANDSDAUER,
  NUTZUNGSART,
  PROJEKTZWECK,
} from './taxonomie';

/** Schlanke Projektdaten für die Filterung im Browser */
export interface FilterProjekt {
  slug: string;
  titel: string;
  stadt: string;
  projekttraeger: string;
  kategorie: string[];
  nutzungsart: string[];
  projektzweck: string[];
  leerstandsdauer: string[];
  /** Index in GESAMTKOSTEN, -1 = keine Angabe */
  kosten: number;
  foerderung: 'ja' | 'nein' | null;
  koordinaten: [number, number] | null;
  datum: number;
  bild: string | null;
  einwohnerzahl: string | null;
}

export type ListenFacette = 'kategorie' | 'nutzungsart' | 'projektzweck' | 'leerstandsdauer' | 'foerderung';

export interface FacettenDef {
  key: ListenFacette;
  /** Beschriftung der Filter-Pill */
  label: string;
  /** Überschrift im Panel */
  titel: string;
  /** Glossarbegriff für das ⓘ an der Überschrift */
  begriff?: string;
  /** ⓘ an jeder Option (Wert = Glossarbegriff) */
  optionInfo: boolean;
  werte: readonly string[];
}

export const FACETTEN: FacettenDef[] = [
  { key: 'kategorie', label: 'Leerstandstyp', titel: 'Leerstandstyp', begriff: 'Kategorie', optionInfo: true, werte: KATEGORIE },
  {
    key: 'nutzungsart',
    label: 'Nutzungsart',
    titel: 'Nutzungsart nach Projektabschluss',
    begriff: 'Nutzungsart nach Projektabschluss',
    optionInfo: true,
    werte: NUTZUNGSART,
  },
  { key: 'projektzweck', label: 'Projektzweck', titel: 'Projektzweck', begriff: 'Projektzweck', optionInfo: true, werte: PROJEKTZWECK },
  {
    key: 'leerstandsdauer',
    label: 'Leerstandsdauer',
    titel: 'Dauer des Leerstands vor Projektstart',
    begriff: 'Dauer des Leerstands vor Projektstart',
    optionInfo: false,
    werte: LEERSTANDSDAUER,
  },
  { key: 'foerderung', label: 'Förderung', titel: 'Förderung erhalten', optionInfo: false, werte: ['ja', 'nein'] },
];

export const FOERDERUNG_LABEL: Record<string, string> = { ja: 'Mit Förderung', nein: 'Ohne Förderung' };

export const SORTIERUNGEN = [
  { key: 'neueste', label: 'Neueste' },
  { key: 'titel', label: 'Titel A–Z' },
  { key: 'stadt', label: 'Stadt A–Z' },
  { key: 'kosten-auf', label: 'Kosten aufsteigend' },
  { key: 'kosten-ab', label: 'Kosten absteigend' },
  { key: 'einwohner', label: 'Ähnliche Einwohnerzahl' },
] as const;
export type Sortierung = (typeof SORTIERUNGEN)[number]['key'];

export type Ansicht = 'beides' | 'liste' | 'karte';

export interface FilterZustand {
  q: string;
  kategorie: string[];
  nutzungsart: string[];
  projektzweck: string[];
  leerstandsdauer: string[];
  foerderung: string[];
  /** Kostenbereich als Indizes in GESAMTKOSTEN (einschließlich) */
  kosten: [number, number];
  sort: Sortierung;
  /** Einwohnerklasse (Index in EINWOHNERZAHL) für die Sortierung „Ähnliche Einwohnerzahl“ */
  ew: number | null;
  ansicht: Ansicht;
}

export const KOSTEN_MAX = GESAMTKOSTEN.length - 1;

export function leererZustand(): FilterZustand {
  return {
    q: '',
    kategorie: [],
    nutzungsart: [],
    projektzweck: [],
    leerstandsdauer: [],
    foerderung: [],
    kosten: [0, KOSTEN_MAX],
    sort: 'neueste',
    ew: null,
    ansicht: 'beides',
  };
}

export const kostenAktiv = (z: FilterZustand) => z.kosten[0] > 0 || z.kosten[1] < KOSTEN_MAX;

/** Anzahl gesetzter Filter einer Facette (für „Nutzungsart · 1“) */
export function anzahlAktiv(z: FilterZustand, key: ListenFacette | 'kosten'): number {
  if (key === 'kosten') return kostenAktiv(z) ? 1 : 0;
  return z[key].length;
}

// ── URL ────────────────────────────────────────────────────────────────

const wertZuParam = (wert: string) => slugify(wert);

function paramZuWerte(param: string | null, werte: readonly string[]): string[] {
  if (!param) return [];
  const kuerzel = param.split(',');
  return werte.filter((w) => kuerzel.includes(wertZuParam(w)));
}

export function zustandAusUrl(params: URLSearchParams): FilterZustand {
  const z = leererZustand();
  z.q = params.get('q')?.trim() ?? '';
  for (const f of FACETTEN) z[f.key] = paramZuWerte(params.get(f.key), f.werte);
  const kosten = params.get('kosten')?.match(/^(\d+)-(\d+)$/);
  if (kosten) {
    const a = Math.max(0, Math.min(KOSTEN_MAX, Number(kosten[1])));
    const b = Math.max(0, Math.min(KOSTEN_MAX, Number(kosten[2])));
    z.kosten = [Math.min(a, b), Math.max(a, b)];
  }
  const sort = params.get('sort');
  if (SORTIERUNGEN.some((s) => s.key === sort)) z.sort = sort as Sortierung;
  const ew = Number(params.get('ew'));
  if (params.has('ew') && Number.isInteger(ew) && ew >= 0 && ew < EINWOHNERZAHL.length) z.ew = ew;
  const ansicht = params.get('ansicht');
  if (ansicht === 'liste' || ansicht === 'karte') z.ansicht = ansicht;
  return z;
}

export function zustandZuParams(z: Partial<FilterZustand>): URLSearchParams {
  const params = new URLSearchParams();
  if (z.q) params.set('q', z.q);
  for (const f of FACETTEN) {
    const werte = z[f.key];
    if (werte?.length) params.set(f.key, werte.map(wertZuParam).join(','));
  }
  if (z.kosten && (z.kosten[0] > 0 || z.kosten[1] < KOSTEN_MAX)) params.set('kosten', `${z.kosten[0]}-${z.kosten[1]}`);
  if (z.sort && z.sort !== 'neueste') params.set('sort', z.sort);
  if (z.sort === 'einwohner' && z.ew !== null && z.ew !== undefined) params.set('ew', String(z.ew));
  if (z.ansicht && z.ansicht !== 'beides') params.set('ansicht', z.ansicht);
  return params;
}

/** Link auf Entdecken mit gesetzten Filtern (für Startseite, Projekt-Finder, Glossar) */
export function entdeckenLink(base: string, z: Partial<FilterZustand>): string {
  const qs = zustandZuParams(z).toString();
  return `${base}entdecken/${qs ? `?${qs}` : ''}`;
}

// ── Filtern ────────────────────────────────────────────────────────────

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '');

function passtFacette(p: FilterProjekt, key: ListenFacette, gewaehlt: string[]): boolean {
  if (!gewaehlt.length) return true;
  if (key === 'foerderung') return p.foerderung !== null && gewaehlt.includes(p.foerderung);
  return p[key].some((w) => gewaehlt.includes(w));
}

/** Prüft alle Filter; `ohne` lässt eine Facette aus (für Trefferzahlen je Option) */
export function passt(p: FilterProjekt, z: FilterZustand, ohne?: ListenFacette | 'kosten'): boolean {
  if (z.q) {
    const text = norm(`${p.titel} ${p.stadt} ${p.projekttraeger}`);
    if (!norm(z.q).split(/\s+/).every((t) => text.includes(t))) return false;
  }
  for (const f of FACETTEN) {
    if (f.key !== ohne && !passtFacette(p, f.key, z[f.key])) return false;
  }
  if (ohne !== 'kosten' && kostenAktiv(z)) {
    if (p.kosten < 0 || p.kosten < z.kosten[0] || p.kosten > z.kosten[1]) return false;
  }
  return true;
}

/** Trefferzahl je Option einer Facette (unter Berücksichtigung aller anderen Filter) */
export function trefferJeOption(projekte: FilterProjekt[], z: FilterZustand, f: FacettenDef): Map<string, number> {
  const basis = projekte.filter((p) => passt(p, z, f.key));
  return new Map(f.werte.map((w) => [w, basis.filter((p) => passtFacette(p, f.key, [w])).length]));
}

export function sortiere(projekte: FilterProjekt[], sort: Sortierung, ew: number | null = null): FilterProjekt[] {
  const de = (a: string, b: string) => a.localeCompare(b, 'de');
  const kosten = (p: FilterProjekt) => (p.kosten < 0 ? Infinity : p.kosten);
  const list = [...projekte];
  switch (sort) {
    case 'titel':
      return list.sort((a, b) => de(a.titel.replace(/^[„"]/, ''), b.titel.replace(/^[„"]/, '')));
    case 'stadt':
      return list.sort((a, b) => de(a.stadt.replace(/^Stadt (Amt )?/, ''), b.stadt.replace(/^Stadt (Amt )?/, '')));
    case 'kosten-auf':
      return list.sort((a, b) => kosten(a) - kosten(b) || b.datum - a.datum);
    case 'kosten-ab':
      return list.sort((a, b) => (kosten(b) === Infinity ? -1 : kosten(b)) - (kosten(a) === Infinity ? -1 : kosten(a)) || b.datum - a.datum);
    case 'einwohner': {
      // Nähe zur gewählten Einwohnerklasse, ohne Wahl: aufsteigend
      const idx = (p: FilterProjekt) => {
        const i = p.einwohnerzahl ? EINWOHNERZAHL.indexOf(p.einwohnerzahl as (typeof EINWOHNERZAHL)[number]) : -1;
        return i < 0 ? Infinity : ew === null ? i : Math.abs(i - ew);
      };
      return list.sort((a, b) => idx(a) - idx(b) || b.datum - a.datum);
    }
    default:
      return list.sort((a, b) => b.datum - a.datum || de(a.titel, b.titel));
  }
}

/** Beschriftung eines aktiven Filterwerts für die entfernbaren Chips */
export function chipLabel(key: ListenFacette, wert: string): string {
  return key === 'foerderung' ? FOERDERUNG_LABEL[wert] : wert;
}
