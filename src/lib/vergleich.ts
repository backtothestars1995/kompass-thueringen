/**
 * Vergleichsauswahl: bis zu 3 Projekte (Slugs), lokal im Browser gespeichert.
 * Unabhängig von der Merkliste; der Vergleich ist zusätzlich per Link teilbar.
 */
export const MAX_VERGLEICH = 3;
const STORAGE_KEY = 'kompass-vergleich';
const CHANGE_EVENT = 'vergleich:change';

export function getVergleich(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_VERGLEICH)
      : [];
  } catch {
    return [];
  }
}

export function setVergleich(slugs: string[]): void {
  const next = [...new Set(slugs)].slice(0, MAX_VERGLEICH);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // privater Modus o. Ä.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
}

/** Fügt hinzu bzw. entfernt. Gibt false zurück, wenn die Auswahl bereits voll ist. */
export function toggleVergleich(slug: string): boolean {
  const list = getVergleich();
  if (list.includes(slug)) {
    setVergleich(list.filter((s) => s !== slug));
    return true;
  }
  if (list.length >= MAX_VERGLEICH) return false;
  setVergleich([...list, slug]);
  return true;
}

export function onVergleichChange(callback: (slugs: string[]) => void): void {
  window.addEventListener(CHANGE_EVENT, () => callback(getVergleich()));
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) callback(getVergleich());
  });
}
