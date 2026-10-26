import { getCollection, render, type CollectionEntry } from 'astro:content';

export type GlossarEintrag = CollectionEntry<'glossar'>;

export const PLATZHALTER_ERLAEUTERUNG = '[Erläuterung folgt]';

/** true, wenn die Redaktion noch keinen Erläuterungstext eingetragen hat */
export function istLeer(eintrag: GlossarEintrag): boolean {
  return (eintrag.body ?? '').replace(/<!--[\s\S]*?-->/g, '').trim() === '';
}

/**
 * Erläuterungen als reiner Text (für ⓘ-Tooltips), Schlüssel = Begriff.
 * Das Glossar ist die einzige Textquelle für alle ⓘ-Erläuterungen.
 */
export async function getErlaeuterungen(): Promise<Map<string, string>> {
  const eintraege = await getCollection('glossar');
  const map = new Map<string, string>();
  for (const e of eintraege) {
    const text = istLeer(e)
      ? PLATZHALTER_ERLAEUTERUNG
      : (e.body ?? '')
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/[*_#>`]/g, '')
          .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
          .replace(/\s+/g, ' ')
          .trim();
    map.set(e.data.begriff, text);
  }
  return map;
}

export async function getGlossar(): Promise<GlossarEintrag[]> {
  const eintraege = await getCollection('glossar');
  return eintraege.sort((a, b) => a.data.begriff.localeCompare(b.data.begriff, 'de'));
}

export { render };
