/**
 * Fachlich abgestimmte Wertelisten (Schreibweise verbindlich, siehe CLAUDE.md).
 * Nicht eigenmächtig umbenennen oder ergänzen – Schema, Filter, Formular und
 * Vergleich verwenden ausschließlich diese Listen.
 */

export const EINWOHNERZAHL = [
  '0–10.000',
  '10.001–25.000',
  '25.001–50.000',
  '50.001–100.000',
  'ab 100.001',
] as const;

export const EIGENTUEMERSTRUKTUR = [
  'Kommunal',
  'Privat',
  'Erbengemeinschaft',
  'Investor',
  'Privates Wohnungsunternehmen',
  'Kommunales Wohnungsunternehmen',
  'Unbekannt',
] as const;

export const PROJEKTZWECK = [
  'Vermarktung leerstehender Objekte',
  'Zwischennutzung eines leerstehenden Objektes',
  'Dauerhafte Nutzung eines leerstehenden Objektes',
  'Umnutzung eines leerstehenden Objektes',
] as const;

export const LEERSTANDSDAUER = [
  'kurzfristig (1–2 Jahre)',
  'mittelfristig (3–5 Jahre)',
  'langfristig (über 5 Jahre)',
] as const;

export const KATEGORIE = [
  'Struktureller Leerstand',
  'Konjunktureller Leerstand',
  'Fluktuations- / Übergangsleerstand',
  'Eigentümerbedingter Leerstand',
  'Funktionaler Leerstand',
  'Temporärer / strategischer Leerstand',
  'Spekulativer Leerstand',
  'Nutzungsbedingter Leerstand (branchenbezogen)',
  'Herrenloses Grundstück',
] as const;

export const NUTZUNGSART = ['Gewerbe', 'Wohnen', 'Mischnutzung', 'Sondernutzung'] as const;

export const PLANUNGSINSTRUMENTE_INFORMELL = [
  'Integriertes Stadtentwicklungskonzept',
  'Wohnraumentwicklungskonzept',
  'Gewerbeflächenentwicklungskonzept',
  'Innenstadtkonzept',
  'Quartiersentwicklungskonzept',
  'Städtebaulicher Rahmenplan',
] as const;

export const RECHTLICHE_RAHMENBEDINGUNGEN = [
  'Bebauungsplan',
  'Flächennutzungsplan',
  'Sanierungsgebiet',
  'Erhaltungssatzung',
  'Stadtumbaugebiet',
  'Denkmalschutz',
] as const;

/** Reihenfolge = aufsteigende Kosten (wird für den Bandbreiten-Regler genutzt) */
export const GESAMTKOSTEN = [
  'weniger als 5.000 €',
  'bis 10.000 €',
  'bis 20.000 €',
  'bis 50.000 €',
  'bis 100.000 €',
  'bis 250.000 €',
  'bis 500.000 €',
  'bis 1.000.000 €',
  'mehr als 1.000.000 €',
] as const;

export const PERSONELLER_AUFWAND = ['hoch', 'mittel', 'gering'] as const;

export const GLOSSAR_KATEGORIE = ['Leerstandstyp', 'Nutzungsart', 'Projektzweck', 'Planung & Recht', 'Projektdaten'] as const;

export type Einwohnerzahl = (typeof EINWOHNERZAHL)[number];
export type Nutzungsart = (typeof NUTZUNGSART)[number];
export type PersonellerAufwand = (typeof PERSONELLER_AUFWAND)[number];
export type Gesamtkosten = (typeof GESAMTKOSTEN)[number];
export type GlossarKategorie = (typeof GLOSSAR_KATEGORIE)[number];

/** CSS-Variable je Nutzungsart (Marker, Badges, Legende – überall identisch) */
export const NUTZUNGSART_FARBE: Record<Nutzungsart, string> = {
  Gewerbe: 'var(--use-gewerbe)',
  Wohnen: 'var(--use-wohnen)',
  Mischnutzung: 'var(--use-mischnutzung)',
  Sondernutzung: 'var(--use-sondernutzung)',
};

/** Ampel „Personeller Aufwand“ – Farbe nie ohne Textlabel verwenden */
export const AUFWAND_FARBE: Record<PersonellerAufwand, string> = {
  hoch: 'var(--effort-hoch)',
  mittel: 'var(--effort-mittel)',
  gering: 'var(--effort-gering)',
};

/** Anzeige-Label mit großem Anfangsbuchstaben („Mittel“) */
export function aufwandLabel(wert: PersonellerAufwand): string {
  return wert.charAt(0).toUpperCase() + wert.slice(1);
}
