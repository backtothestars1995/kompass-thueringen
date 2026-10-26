/**
 * Projekt-Finder: drei Fragen in Alltagssprache, die intern dieselben Filter
 * wie „Entdecken“ setzen (Leerstandsdauer → Nutzungsart → Förderung/Kosten).
 *
 * Frage 1 stammt aus dem Wireframe; Fragen 2 und 3 sind ein Vorschlag
 * (Stand Oktober 2026) und werden redaktionell noch abgestimmt.
 */
import type { FilterZustand } from './filter';

export interface FinderAntwort {
  label: string;
  /** Filter, die diese Antwort setzt; leer = keine Einschränkung („Weiß ich nicht“) */
  filter: Partial<Pick<FilterZustand, 'leerstandsdauer' | 'nutzungsart' | 'foerderung' | 'kosten'>>;
}

export interface FinderFrage {
  frage: string;
  antworten: FinderAntwort[];
}

export const FINDER_FRAGEN: FinderFrage[] = [
  {
    frage: 'Wie lange steht die Fläche schon leer?',
    antworten: [
      { label: 'Erst kurz (1–2 Jahre)', filter: { leerstandsdauer: ['kurzfristig (1–2 Jahre)'] } },
      { label: 'Schon länger (3–5 Jahre)', filter: { leerstandsdauer: ['mittelfristig (3–5 Jahre)'] } },
      { label: 'Sehr lange (über 5 Jahre)', filter: { leerstandsdauer: ['langfristig (über 5 Jahre)'] } },
      { label: 'Weiß ich nicht', filter: {} },
    ],
  },
  {
    frage: 'Was soll dort künftig passieren?',
    antworten: [
      { label: 'Laden, Büro oder Gastronomie', filter: { nutzungsart: ['Gewerbe'] } },
      { label: 'Wohnen', filter: { nutzungsart: ['Wohnen'] } },
      { label: 'Wohnen und Arbeiten gemischt', filter: { nutzungsart: ['Mischnutzung'] } },
      { label: 'Etwas anderes', filter: { nutzungsart: ['Sondernutzung'] } },
      { label: 'Ist noch offen', filter: {} },
    ],
  },
  {
    frage: 'Wie viel Geld steht ungefähr zur Verfügung?',
    antworten: [
      { label: 'Eher wenig (bis 50.000 €)', filter: { kosten: [0, 3] } },
      { label: 'Ein mittleres Budget (bis 500.000 €)', filter: { kosten: [0, 6] } },
      { label: 'Ein großes Budget (über 500.000 €)', filter: { kosten: [7, 8] } },
      { label: 'Wir brauchen Fördermittel', filter: { foerderung: ['ja'] } },
      { label: 'Weiß ich nicht', filter: {} },
    ],
  },
];
