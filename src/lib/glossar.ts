import { getCollection, type CollectionEntry } from 'astro:content';

export type GlossarEintrag = CollectionEntry<'glossar'>;

export const PLATZHALTER_ERLAEUTERUNG = '[Erläuterung folgt]';

/** true, wenn die Redaktion noch keinen Erläuterungstext eingetragen hat */
export function istLeer(eintrag: GlossarEintrag): boolean {
  return (eintrag.body ?? '').replace(/<!--[\s\S]*?-->/g, '').trim() === '';
}

/** Erläuterung als reiner Text (für ⓘ-Tooltips) */
export function erlaeuterungText(eintrag: GlossarEintrag): string {
  if (istLeer(eintrag)) return PLATZHALTER_ERLAEUTERUNG;
  return (eintrag.body ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[*_#>`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface GlossarInfo {
  id: string;
  begriff: string;
  kategorie: GlossarEintrag['data']['kategorie'];
  text: string;
  leer: boolean;
}

let cache: Promise<Map<string, GlossarInfo>> | undefined;

/**
 * Alle Glossarbegriffe, Schlüssel = Begriff.
 * Das Glossar ist die einzige Textquelle für alle ⓘ-Erläuterungen.
 */
export function getGlossarIndex(): Promise<Map<string, GlossarInfo>> {
  cache ??= getCollection('glossar').then(
    (eintraege) =>
      new Map(
        eintraege.map((e) => [
          e.data.begriff,
          { id: e.id, begriff: e.data.begriff, kategorie: e.data.kategorie, text: erlaeuterungText(e), leer: istLeer(e) },
        ]),
      ),
  );
  return cache;
}

export async function getGlossar(): Promise<GlossarEintrag[]> {
  const eintraege = await getCollection('glossar');
  return eintraege.sort((a, b) => a.data.begriff.localeCompare(b.data.begriff, 'de'));
}
