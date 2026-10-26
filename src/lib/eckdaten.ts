/**
 * Eckdaten eines Projekts – gemeinsame Definition für Steckbrief und Vergleich,
 * damit die Zeilen überall identisch sind (Reihenfolge wie im Wireframe).
 */
import type { Projekt } from './projekte';
import { zeitraumText } from './projekte';
import type { PersonellerAufwand } from './taxonomie';

export type EckdatenGruppe = 'Rahmen' | 'Einordnung' | 'Planung' | 'Ressourcen';

export interface EckdatenZeile {
  key: string;
  gruppe: EckdatenGruppe;
  label: string;
  /** Glossarbegriff für das ⓘ (Kategorie „Projektdaten“) */
  begriff?: string;
  /** Anzeigewert; undefined = keine Angabe */
  wert?: string;
  aufwand?: PersonellerAufwand;
}

const liste = (werte: readonly string[]) => (werte.length ? werte.join(', ') : undefined);

export function foerderungText(p: Projekt['data']): string | undefined {
  if (p.foerderung === undefined) return undefined;
  if (!p.foerderung) return 'Nein';
  return p.foerderprogramm ? `Ja – ${p.foerderprogramm}` : 'Ja';
}

export function eckdaten(projekt: Projekt): EckdatenZeile[] {
  const p = projekt.data;
  return [
    { key: 'stadt', gruppe: 'Rahmen', label: 'Stadt / Kommune', wert: p.stadt },
    { key: 'einwohnerzahl', gruppe: 'Rahmen', label: 'Einwohnerzahl', wert: p.einwohnerzahl },
    { key: 'projekttraeger', gruppe: 'Rahmen', label: 'Projektträger', wert: p.projekttraeger },
    {
      key: 'eigentuemerstruktur',
      gruppe: 'Rahmen',
      label: 'Eigentümerstruktur vor Projektstart',
      wert: liste(p.eigentuemerstruktur),
    },
    { key: 'projektzweck', gruppe: 'Einordnung', label: 'Projektzweck', begriff: 'Projektzweck', wert: liste(p.projektzweck) },
    { key: 'zeitraum', gruppe: 'Einordnung', label: 'Zeitraum des Projektes', wert: zeitraumText(p.zeitraum) },
    {
      key: 'leerstandsdauer',
      gruppe: 'Einordnung',
      label: 'Dauer des Leerstands vor Projektstart',
      begriff: 'Dauer des Leerstands vor Projektstart',
      wert: liste(p.leerstandsdauer),
    },
    { key: 'kategorie', gruppe: 'Einordnung', label: 'Kategorie', begriff: 'Kategorie', wert: liste(p.kategorie) },
    {
      key: 'nutzungsart',
      gruppe: 'Einordnung',
      label: 'Nutzungsart nach Projektabschluss',
      begriff: 'Nutzungsart nach Projektabschluss',
      wert: liste(p.nutzungsart),
    },
    {
      key: 'planungsinstrumente_informell',
      gruppe: 'Planung',
      label: 'Planungsinstrumente (informell)',
      begriff: 'Planungsinstrumente (informell)',
      wert: liste(p.planungsinstrumente_informell),
    },
    {
      key: 'rechtliche_rahmenbedingungen',
      gruppe: 'Planung',
      label: 'Rechtliche Rahmenbedingungen',
      begriff: 'Rechtliche Rahmenbedingungen',
      wert: liste(p.rechtliche_rahmenbedingungen),
    },
    {
      key: 'gesamtkosten',
      gruppe: 'Ressourcen',
      label: 'Gesamtkosten des Projektes',
      begriff: 'Gesamtkosten des Projektes',
      wert: p.gesamtkosten,
    },
    { key: 'foerderung', gruppe: 'Ressourcen', label: 'Förderung', wert: foerderungText(p) },
    {
      key: 'personeller_aufwand',
      gruppe: 'Ressourcen',
      label: 'Personeller Aufwand',
      begriff: 'Personeller Aufwand',
      wert: p.personeller_aufwand,
      aufwand: p.personeller_aufwand,
    },
  ];
}
