import { getCollection, type CollectionEntry } from 'astro:content';

export type Projekt = CollectionEntry<'projekte'>;

const MAX_BESCHREIBUNG = 2500;

/** Zeichen der Projektbeschreibung ohne Markdown-Auszeichnung und HTML-Kommentare */
export function beschreibungslaenge(body: string | undefined): number {
  return (body ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[*_#>`[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim().length;
}

/**
 * Alle veröffentlichten Projekte, neueste zuerst.
 * Prüft zusätzlich die Länge der Projektbeschreibung (Markdown-Inhalt).
 */
export async function getProjekte(): Promise<Projekt[]> {
  const projekte = await getCollection('projekte');
  for (const p of projekte) {
    const n = beschreibungslaenge(p.body);
    if (n > MAX_BESCHREIBUNG) {
      throw new Error(
        `Projekt „${p.id}“: Die Projektbeschreibung ist zu lang (${n} Zeichen, erlaubt sind höchstens ${MAX_BESCHREIBUNG}).`,
      );
    }
  }
  return projekte.sort(sortNeueste);
}

export function sortNeueste(a: Projekt, b: Projekt): number {
  const da = a.data.veroeffentlicht_am?.getTime() ?? 0;
  const db = b.data.veroeffentlicht_am?.getTime() ?? 0;
  return db - da || a.data.titel.localeCompare(b.data.titel, 'de');
}

/** „2021–2023“, „seit 2024“ */
export function zeitraumText(z: Projekt['data']['zeitraum']): string {
  if (!z.ende) return `seit ${z.beginn}`;
  return z.beginn === z.ende ? String(z.beginn) : `${z.beginn}–${z.ende}`;
}

const schnitt = (a: readonly string[], b: readonly string[]) => a.some((x) => b.includes(x));

/**
 * Ähnliche Projekte: gleiche Nutzungsart, gleicher Leerstandstyp, gleicher
 * Projektzweck oder gleiche Einwohnerklasse. Je Grund möglichst ein anderes Projekt.
 */
export function aehnlicheProjekte(projekt: Projekt, alle: Projekt[], anzahl = 3): { projekt: Projekt; grund: string }[] {
  const p = projekt.data;
  const kriterien: { grund: string; passt: (q: Projekt['data']) => boolean }[] = [
    { grund: 'Gleicher Projektzweck', passt: (q) => schnitt(p.projektzweck, q.projektzweck) },
    { grund: 'Gleicher Leerstandstyp', passt: (q) => schnitt(p.kategorie, q.kategorie) },
    { grund: 'Ähnliche Einwohnerzahl', passt: (q) => !!p.einwohnerzahl && p.einwohnerzahl === q.einwohnerzahl },
    { grund: 'Gleiche Nutzungsart', passt: (q) => schnitt(p.nutzungsart, q.nutzungsart) },
  ];
  const andere = alle.filter((q) => q.id !== projekt.id);
  // Punktzahl = Anzahl Übereinstimmungen; bei Gleichstand neuere zuerst (alle ist bereits sortiert)
  const score = (q: Projekt) => kriterien.filter((k) => k.passt(q.data)).length;
  const result: { projekt: Projekt; grund: string }[] = [];
  const genutzt = new Set<string>();
  for (const k of kriterien) {
    if (result.length >= anzahl) break;
    const kandidat = andere
      .filter((q) => !genutzt.has(q.id) && k.passt(q.data))
      .sort((a, b) => score(b) - score(a))[0];
    if (kandidat) {
      result.push({ projekt: kandidat, grund: k.grund });
      genutzt.add(kandidat.id);
    }
  }
  for (const q of andere.sort((a, b) => score(b) - score(a))) {
    if (result.length >= anzahl) break;
    if (!genutzt.has(q.id)) {
      result.push({ projekt: q, grund: 'Weiteres Projekt' });
      genutzt.add(q.id);
    }
  }
  return result;
}
