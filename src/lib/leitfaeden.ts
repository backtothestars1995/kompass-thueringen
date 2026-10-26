import { getCollection, type CollectionEntry } from 'astro:content';

export type Leitfaden = CollectionEntry<'leitfaeden'>;

export async function getLeitfaeden(): Promise<Leitfaden[]> {
  return (await getCollection('leitfaeden')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
}

export const leitfadenLeer = (l: Leitfaden) => (l.body ?? '').replace(/<!--[\s\S]*?-->/g, '').trim() === '';

/** Lesezeit in Minuten: redaktionelle Angabe, sonst geschätzt (ca. 200 Wörter pro Minute) */
export function lesezeit(l: Leitfaden): number | undefined {
  if (l.data.lesezeit_minuten) return l.data.lesezeit_minuten;
  if (leitfadenLeer(l)) return undefined;
  const woerter = (l.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}

/** „PDF · 4 Seiten · ca. 7 Min. Lesezeit“ */
export function leitfadenMeta(l: Leitfaden): string {
  const teile = [];
  if (l.data.pdf) teile.push(l.data.seiten ? `PDF · ${l.data.seiten} ${l.data.seiten === 1 ? 'Seite' : 'Seiten'}` : 'PDF');
  const min = lesezeit(l);
  teile.push(min ? `ca. ${min} Min. Lesezeit` : '[Lesezeit]');
  return teile.join(' · ');
}
