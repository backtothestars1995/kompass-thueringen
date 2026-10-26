import { getImage } from 'astro:assets';
import type { FilterProjekt } from './filter';
import type { Projekt } from './projekte';
import { GESAMTKOSTEN } from './taxonomie';

/** Schlanke Projektdaten für Filter, Karte und Projekt-Finder im Browser */
export async function filterDaten(projekte: Projekt[]): Promise<FilterProjekt[]> {
  return Promise.all(
    projekte.map(async (p) => ({
      slug: p.id,
      titel: p.data.titel,
      stadt: p.data.stadt,
      projekttraeger: p.data.projekttraeger,
      kategorie: [...p.data.kategorie],
      nutzungsart: [...p.data.nutzungsart],
      projektzweck: [...p.data.projektzweck],
      leerstandsdauer: [...p.data.leerstandsdauer],
      kosten: p.data.gesamtkosten ? GESAMTKOSTEN.indexOf(p.data.gesamtkosten) : -1,
      foerderung: p.data.foerderung === undefined ? null : p.data.foerderung ? 'ja' : 'nein',
      koordinaten: p.data.koordinaten ?? null,
      datum: p.data.veroeffentlicht_am?.getTime() ?? 0,
      bild: p.data.bilder[0] ? (await getImage({ src: p.data.bilder[0].pfad, width: 480, format: 'webp' })).src : null,
      einwohnerzahl: p.data.einwohnerzahl ?? null,
    })),
  );
}

/** JSON sicher in ein <script type="application/json"> schreiben */
export const alsJson = (daten: unknown) => JSON.stringify(daten).replace(/</g, '\\u003c');
