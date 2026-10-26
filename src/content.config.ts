/**
 * Inhaltsmodell KOMPASS Thüringen.
 *
 * Fehlermeldungen sind bewusst ausführlich und deutsch: Wer im GitHub-
 * Webinterface ein Projekt anlegt, sieht sie im Protokoll von GitHub Actions,
 * wenn der Build abbricht.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  EIGENTUEMERSTRUKTUR,
  EINWOHNERZAHL,
  GESAMTKOSTEN,
  GLOSSAR_KATEGORIE,
  KATEGORIE,
  LEERSTANDSDAUER,
  NUTZUNGSART,
  PERSONELLER_AUFWAND,
  PLANUNGSINSTRUMENTE_INFORMELL,
  PROJEKTZWECK,
  RECHTLICHE_RAHMENBEDINGUNGEN,
} from './lib/taxonomie';

/** Leer gelassene Felder („feld:“ ohne Wert) gelten als nicht ausgefüllt */
const optional = <T extends z.ZodType>(schema: T) => schema.nullish().transform((v) => v ?? undefined);
const liste = <T extends z.ZodType>(schema: z.ZodArray<T>) => schema.nullish().transform((v) => v ?? []);

const pflichtText = (feld: string) =>
  z
    .string({ error: `„${feld}“ fehlt. Bitte einen Text eintragen.` })
    .trim()
    .min(1, { error: `„${feld}“ darf nicht leer sein.` });

/** Auswahl aus einer festen Werteliste – Fehlermeldung nennt alle erlaubten Werte */
const auswahl = <T extends readonly [string, ...string[]]>(feld: string, werte: T) =>
  z.enum(werte, {
    error: (issue) =>
      `„${feld}“: Der Wert ${issue.input === undefined ? 'fehlt' : `„${String(issue.input)}“ ist nicht erlaubt`}. ` +
      `Erlaubt sind (genaue Schreibweise): ${werte.map((w) => `„${w}“`).join(', ')}.`,
  });

/** Mehrfachauswahl (Liste) aus einer festen Werteliste; leer erlaubt */
const mehrfach = <T extends readonly [string, ...string[]]>(feld: string, werte: T) =>
  liste(
    z.array(auswahl(feld, werte), {
      error: `„${feld}“ muss eine Liste sein, z. B.:\n${feld}:\n  - ${werte[0]}`,
    }),
  );

const jahr = (feld: string) =>
  z
    .number({ error: `„${feld}“ muss eine Jahreszahl sein, z. B. 2024 (ohne Anführungszeichen).` })
    .int({ error: `„${feld}“ muss eine ganze Jahreszahl sein, z. B. 2024.` })
    .min(1900, { error: `„${feld}“: Bitte eine vierstellige Jahreszahl eintragen.` })
    .max(2100, { error: `„${feld}“: Bitte eine vierstellige Jahreszahl eintragen.` });

const projekte = defineCollection({
  // Dateien, die mit „_“ beginnen (z. B. _vorlage.md), werden nicht veröffentlicht.
  loader: glob({ pattern: ['*.md', '!_*.md'], base: './src/content/projekte' }),
  schema: ({ image }) =>
    z
      .object({
        titel: pflichtText('titel'),
        stadt: pflichtText('stadt'),
        einwohnerzahl: optional(auswahl('einwohnerzahl', EINWOHNERZAHL)),
        projekttraeger: pflichtText('projekttraeger'),
        eigentuemerstruktur: mehrfach('eigentuemerstruktur', EIGENTUEMERSTRUKTUR),
        projektzweck: mehrfach('projektzweck', PROJEKTZWECK),
        zeitraum: z.object(
          {
            beginn: jahr('zeitraum → beginn'),
            ende: optional(jahr('zeitraum → ende')),
          },
          { error: '„zeitraum“ fehlt. Bitte mindestens „beginn“ als Jahreszahl angeben.' },
        ),
        leerstandsdauer: mehrfach('leerstandsdauer', LEERSTANDSDAUER),
        kategorie: mehrfach('kategorie', KATEGORIE),
        nutzungsart: mehrfach('nutzungsart', NUTZUNGSART),
        planungsinstrumente_informell: mehrfach('planungsinstrumente_informell', PLANUNGSINSTRUMENTE_INFORMELL),
        rechtliche_rahmenbedingungen: mehrfach('rechtliche_rahmenbedingungen', RECHTLICHE_RAHMENBEDINGUNGEN),
        gesamtkosten: optional(auswahl('gesamtkosten', GESAMTKOSTEN)),
        foerderung: optional(z.boolean({ error: '„foerderung“ muss ja oder nein sein: true oder false.' })),
        foerderprogramm: optional(z.string().trim()),
        personeller_aufwand: optional(auswahl('personeller_aufwand', PERSONELLER_AUFWAND)),
        projektziel: optional(
          z.string().trim().max(250, { error: '„projektziel“ ist zu lang: höchstens 250 Zeichen.' }),
        ),
        projektfahrplan: liste(z.array(z.string().trim().min(1))),
        partnerschaften: liste(z.array(z.string().trim().min(1))),
        hindernisse: optional(
          z.string().trim().max(1500, { error: '„hindernisse“ ist zu lang: höchstens 1.500 Zeichen.' }),
        ),
        kontakte: liste(
          z.array(
            z.object({
              name: pflichtText('kontakte → name'),
              institution: optional(z.string().trim()),
              email: optional(z.email({ error: '„kontakte → email“ ist keine gültige E-Mail-Adresse.' })),
              telefon: optional(z.string().trim()),
            }),
          ),
        ),
        bilder: liste(
          z.array(
            z.object({
              pfad: image(),
              alt: pflichtText('bilder → alt (Alternativtext: Was ist auf dem Bild zu sehen?)'),
              bildunterschrift: optional(z.string().trim()),
            }),
          ),
        ),
        dokumente: liste(z.array(z.string().trim().min(1))),
        projekthomepage: optional(
          z.url({ error: '„projekthomepage“ muss eine vollständige Adresse sein, z. B. https://www.beispiel.de' }),
        ),
        adresse: optional(z.string().trim()),
        koordinaten: z
          .tuple([z.number(), z.number()], {
            error: '„koordinaten“ müssen so angegeben werden: [Breitengrad, Längengrad], z. B. [50.72, 11.34]',
          })
          .refine(([lat, lng]) => lat > 50 && lat < 51.7 && lng > 9.8 && lng < 12.7, {
            error:
              '„koordinaten“ liegen nicht in Thüringen. Reihenfolge prüfen: erst Breitengrad (ca. 50–51,6), dann Längengrad (ca. 9,8–12,6).',
          })
          .nullish()
          .transform((v) => v ?? undefined),
        im_fokus: z.boolean().nullish().transform((v) => v ?? false),
        veroeffentlicht_am: optional(
          z.coerce.date({ error: '„veroeffentlicht_am“ muss ein Datum sein, z. B. 2026-10-26.' }),
        ),
      })
      .refine((p) => !p.zeitraum.ende || p.zeitraum.ende >= p.zeitraum.beginn, {
        error: '„zeitraum“: Das Ende liegt vor dem Beginn.',
        path: ['zeitraum', 'ende'],
      }),
});

const glossar = defineCollection({
  loader: glob({ pattern: ['*.md', '!_*.md'], base: './src/content/glossar' }),
  schema: z.object({
    begriff: pflichtText('begriff'),
    kategorie: auswahl('kategorie', GLOSSAR_KATEGORIE),
  }),
});

const leitfaeden = defineCollection({
  loader: glob({ pattern: ['*.md', '!_*.md'], base: './src/content/leitfaeden' }),
  schema: z.object({
    titel: pflichtText('titel'),
    reihenfolge: z.number().int(),
    kurztitel: optional(z.string().trim()),
    pdf: optional(z.string().trim()),
    seiten: optional(z.number().int().positive()),
    lesezeit_minuten: optional(z.number().int().positive()),
  }),
});

export const collections = { projekte, glossar, leitfaeden };
