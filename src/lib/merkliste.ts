/**
 * Merkliste: speichert die Slugs gemerkter Projekte lokal im Browser
 * (localStorage). Kein Konto, keine Cookies, nichts verlässt den Browser.
 */
const STORAGE_KEY = 'kompass-merkliste';
const CHANGE_EVENT = 'merkliste:change';

export function getMerkliste(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function save(slugs: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // z. B. privater Modus – Merkliste gilt dann nur für diese Seite
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: slugs }));
}

export function isGemerkt(slug: string): boolean {
  return getMerkliste().includes(slug);
}

export function toggleMerken(slug: string): boolean {
  const list = getMerkliste();
  const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
  save(next);
  return next.includes(slug);
}

export function setMerkliste(slugs: string[]): void {
  save([...new Set(slugs)]);
}

export function onMerklisteChange(callback: (slugs: string[]) => void): void {
  window.addEventListener(CHANGE_EVENT, () => callback(getMerkliste()));
  // Änderungen aus anderen Tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) callback(getMerkliste());
  });
}
