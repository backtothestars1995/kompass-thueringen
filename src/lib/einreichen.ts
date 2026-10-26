/**
 * Einstellungen für „Projekt einreichen“.
 * GitHub Pages kann keine Formulardaten empfangen; die Angaben werden daher
 * als vorausgefüllte E-Mail (und optional als Textdatei) übergeben.
 */

/** Empfängeradresse der Redaktion – von der Redaktion festzulegen. Leer = Platzhalter anzeigen. */
export const EINREICHUNG_EMAIL = '';

export const EINREICHUNG_BETREFF = 'Projektvorschlag für den KOMPASS Thüringen';

/** Kurzbeschreibungen der Projektzwecke im Assistenten (aus dem Wireframe) */
export const PROJEKTZWECK_KURZ: Record<string, { label: string; text: string }> = {
  'Vermarktung leerstehender Objekte': { label: 'Vermarktung leerstehender Objekte', text: 'Flächen sichtbar machen und vermitteln' },
  'Zwischennutzung eines leerstehenden Objektes': { label: 'Zwischennutzung', text: 'Fläche befristet beleben' },
  'Dauerhafte Nutzung eines leerstehenden Objektes': { label: 'Dauerhafte Nutzung', text: 'Fläche langfristig neu nutzen' },
  'Umnutzung eines leerstehenden Objektes': { label: 'Umnutzung', text: 'Nutzung grundlegend ändern' },
};

export const MAX_BILD_MB = 2;
export const MAX_DOKUMENT_MB = 10;
