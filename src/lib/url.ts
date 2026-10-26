/**
 * Baut interne Links immer über BASE_URL, damit ein späterer Wechsel
 * auf eine eigene Domain nur die Konfiguration in astro.config.mjs ändert.
 *
 * url('entdecken/') → '/kompass-thueringen/entdecken/'
 */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return `${base}/${clean}`;
}
