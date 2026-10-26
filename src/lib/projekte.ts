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
