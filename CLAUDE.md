# KOMPASS Thüringen – Website (Variante 2)

## Projekt

KOMPASS Thüringen ist ein Projektpool mit positiven Beispielen zur Nachnutzung ehemals gewerblicher Leerstände in Thüringer Innenstädten. Er ist ein Projekt des Thüringer Aktionsbündnisses „Innenstädte mit Zukunft“ (AG Leerstandsbewältigung, organisiert durch die LEG Thüringen). Die bestehende Seite www.kompass-thueringen.de läuft auf WordPress; dieses Repository setzt die neu konzipierte **Variante 2** als statische Website um.

Verbindliche Referenzen liegen in `docs/`:
- `docs/KOMPASS_Thueringen_Wireframes_Variante2.pdf` – Wireframes aller Seiten (Layout und Funktionen; gelbe Hinweise = Funktionsbeschreibung)
- `docs/Leistungsverzeichnis_KOMPASS_Thueringen.docx` – Funktionsumfang je Seite

Bei Widersprüchen gilt: Wireframe Variante 2 vor Leistungsverzeichnis.

## Zielgruppen und Sprache

Drei Zielgruppen, alle Inhalte müssen für alle drei funktionieren:
1. Kommunen und Stadtplanungsämter – fachlich präzise
2. Breite Öffentlichkeit und Bürger:innen – verständlich, ohne Fachjargon
3. Investoren und Projektentwickler – wirkungsorientiert (Kosten, Aufwand, Ergebnis)

- Alle sichtbaren Texte auf Deutsch. Gendern mit Doppelpunkt (Bürger:innen).
- Fachbegriffe bekommen ein ⓘ-Symbol mit laienverständlicher Erläuterung (siehe Glossar).
- Code, Variablen und Dateinamen auf Englisch; Kommentare dürfen deutsch sein.

## Arbeitsweise

- **Bei Unklarheiten nachfragen statt raten.** Das gilt besonders für Inhalte, Fachbegriffe und alles unter „Offene Entscheidungen“.
- **Keine Inhalte erfinden.** Keine Projektdaten, Kennzahlen, Zitate oder Definitionen ausdenken. Fehlende Inhalte als sichtbaren Platzhalter in eckigen Klammern setzen, z. B. `[Projektziel]`, `[Erläuterung Leerstandstyp]`.
- Seite für Seite vorgehen, in der Reihenfolge unter „Bauplan“. Nach jedem Schritt `npm run build` ausführen und die Seite im Browser prüfen (Desktop 1280 px und Mobil 390 px).
- Kleine, nachvollziehbare Commits mit deutscher Commit-Nachricht.

## Technik

- **Astro** (statische Ausgabe), TypeScript, ohne UI-Framework. Interaktion (Filter, Projekt-Finder, Merkliste, Karte) als schlankes Vanilla-TypeScript in Astro-Komponenten.
- **Inhalte als Content Collections** in `src/content/` mit Schema in `src/content.config.ts` (zod). Ein Projekt = eine Markdown-Datei mit Frontmatter. Redakteur:innen sollen neue Projekte ohne Programmierkenntnisse im GitHub-Webinterface anlegen können: Schema-Felder klar benennen, Fehlermeldungen verständlich halten, eine Vorlagedatei `src/content/projekte/_vorlage.md` mitliefern (vom Build ausgeschlossen).
- **Karte:** Leaflet (per npm, nicht per CDN) mit OpenStreetMap-Kacheln und sichtbarer Attribution. Kein Google Maps.
- **Schriften:** selbst gehostet über `@fontsource` (Space Grotesk, IBM Plex Sans). Keine Google Fonts, keine externen CDNs.
- **Kein Tracking, keine Cookies, keine eingebetteten Drittanbieter-Inhalte.** Die Merkliste speichert lokal im Browser (localStorage) und funktioniert ohne Konto.
- **Hosting:** GitHub Pages, Deployment per GitHub Actions (`.github/workflows/deploy.yml`, offizielle Astro-Action). In `astro.config.mjs` `site` und `base` für `https://<benutzer>.github.io/kompass-thueringen` setzen; alle internen Links über `import.meta.env.BASE_URL` bilden, damit ein späterer Wechsel auf eine eigene Domain nur die Konfiguration ändert.
- **Barrierefreiheit:** WCAG 2.1 AA als Mindeststandard (öffentliche Hand, BITV 2.0). Semantisches HTML, echte `<button>`/`<a>`/`<label>`, sichtbarer Fokus, Kontrast ≥ 4,5:1 für Text, Tastaturbedienung für Filter, Karte und Projekt-Finder, `prefers-reduced-motion` respektieren, Laufbänder mit Pause-Schalter.
- SEO: je Seite eigener `<title>` und Meta-Description, sprechende URLs (`/projekte/ruansi-rudolstadt/`), `sitemap.xml` über `@astrojs/sitemap`.

Befehle: `npm install` · `npm run dev` · `npm run build` · `npm run preview`

## Gestaltung (Design-Tokens)

Als CSS-Custom-Properties in `src/styles/tokens.css` anlegen und nur über diese Tokens arbeiten. Farben und Schriften sind vorläufig, bis eine CI festgelegt ist.

| Token | Wert | Verwendung |
|---|---|---|
| `--ink` | `#16181D` | Text, dunkle Bühnen, Footer |
| `--paper` | `#F6F4EF` | Seitenhintergrund |
| `--surface` | `#FFFFFF` | Karten |
| `--sand` | `#E7E1D4` | Akzentflächen, Projekt-Finder |
| `--line` | `#E3DFD6` | Rahmen, Trennlinien |
| `--muted` | `#5E6068` | Sekundärtext |
| `--accent` | `#C4421C` | Hauptakzent, Primär-Buttons |
| `--accent-light` | `#F08A64` | Akzent auf dunklem Grund |
| `--note` | `#FFF4C2` | (nur Wireframe-Hinweise, nicht live verwenden) |

Nutzungsart-Farben (Kartenmarker, Badges, Legende – überall identisch):
Gewerbe `#2F5BEA` · Wohnen `#16855A` · Mischnutzung `#E0A100` · Sondernutzung `#7C4DDB`

Ampel „Personeller Aufwand“: hoch `#E03E3E` · mittel `#E8B400` · gering `#1FA35B`. Nie nur über Farbe kommunizieren, immer mit Textlabel.

Typografie: Überschriften Space Grotesk 500/700 (letter-spacing −0,02em), Fließtext IBM Plex Sans 400/500/600. Runde Formen: Buttons und Chips voll abgerundet, Karten 14–28 px Radius.

## Seitenstruktur

Hauptnavigation: Entdecken · Wissen · Über KOMPASS · Kontakt · Button „Projekt einreichen“ · Merkliste-Symbol mit Zähler.

| Seite | Route | Kernfunktionen (Details im Wireframe) |
|---|---|---|
| Startseite | `/` | Hero mit stilisierter Thüringen-Karte und Projektvorschau, Suche + Schnellfilter-Chips, Kennzahlen (automatisch aus den Daten gezählt), Einstieg nach Zielgruppe, Projekt-Finder (3 Fragen → setzt Filter), Projekt im Fokus, Karussell „Zuletzt hinzugefügt“, Begriff des Tages, Leitfäden, Partnerlogos, Footer |
| Entdecken | `/entdecken/` | Filterleiste (siehe Filter), aktive Filter als entfernbare Chips, Trefferzahl je Option, Sortierung, Ansicht Liste + Karte / Liste / Karte, Hover-Kopplung Karte ↔ Liste, Marker-Cluster, Merken und Vergleichen; Filterzustand in der URL (teilbar) |
| Projekt-Steckbrief | `/projekte/[slug]/` | Vollflächiges Hauptbild, Kennzahlen-Band (Zeitraum, Kosten, Förderung, Einwohnerzahl, Ampel), Kapitel 01–07 mit mitlaufender Inhaltsnavigation, Fahrplan als Zeitleiste, Eckdaten-Raster, Lagekarte, ähnliche Projekte, nächstes Projekt |
| Merkliste & Vergleich | `/vergleich/` | Bis zu 3 Projekte nebeneinander, alle Eckdaten zeilenweise, Unterschiede markiert, „Nur Unterschiede“, per Link teilbar |
| Wissen | `/wissen/` | Praxis-Leitfäden (online lesen + PDF), Leerstands-ABC (Glossar mit A–Z und Kategorien, jeder Begriff verlinkt auf passende Projekte), Hintergrund/Idee |
| Über KOMPASS | `/ueber/` | Idee, Aktionsbündnis, AG Leerstandsbewältigung, Partner |
| Kontakt | `/kontakt/` | Siehe Offene Entscheidungen (Formular) |
| Projekt einreichen | `/einreichen/` | Assistent in 6 Schritten (Basisdaten · Einordnung · Planung · Beschreibung · Aufwand & Kosten · Medien & Kontakt), Live-Vorschau, Vollständigkeitsanzeige |
| Rechtliches | `/impressum/`, `/datenschutz/`, `/barrierefreiheit/` | Pflichtseiten, Inhalte liefert die Redaktion |

## Datenmodell Projekt (`src/content/projekte/*.md`)

Feldnamen und Wertelisten sind fachlich abgestimmt; die Schreibweise in dieser Tabelle ist verbindlich. Mehrfachauswahl = Array.

| Feld | Typ | Werte / Hinweis |
|---|---|---|
| `titel` | Text | Pflicht |
| `stadt` | Text | Pflicht |
| `einwohnerzahl` | Auswahl | `0–10.000` · `10.001–25.000` · `25.001–50.000` · `50.001–100.000` · `ab 100.001` |
| `projekttraeger` | Text | Pflicht |
| `eigentuemerstruktur` | Mehrfach, optional | Kommunal · Privat · Erbengemeinschaft · Investor · Privates Wohnungsunternehmen · Kommunales Wohnungsunternehmen · Unbekannt |
| `projektzweck` | Mehrfach | Vermarktung leerstehender Objekte · Zwischennutzung eines leerstehenden Objektes · Dauerhafte Nutzung eines leerstehenden Objektes · Umnutzung eines leerstehenden Objektes |
| `zeitraum` | Objekt | `beginn` (Jahr, Pflicht), `ende` (Jahr, optional – leer = laufend) |
| `leerstandsdauer` | Mehrfach, optional | kurzfristig (1–2 Jahre) · mittelfristig (3–5 Jahre) · langfristig (über 5 Jahre) |
| `kategorie` | Mehrfach | Struktureller Leerstand · Konjunktureller Leerstand · Fluktuations- / Übergangsleerstand · Eigentümerbedingter Leerstand · Funktionaler Leerstand · Temporärer / strategischer Leerstand · Spekulativer Leerstand · Nutzungsbedingter Leerstand (branchenbezogen) · Herrenloses Grundstück |
| `nutzungsart` | Mehrfach | Gewerbe · Wohnen · Mischnutzung · Sondernutzung (erster Wert bestimmt die Markerfarbe) |
| `planungsinstrumente_informell` | Mehrfach, optional | Integriertes Stadtentwicklungskonzept · Wohnraumentwicklungskonzept · Gewerbeflächenentwicklungskonzept · Innenstadtkonzept · Quartiersentwicklungskonzept · Städtebaulicher Rahmenplan |
| `rechtliche_rahmenbedingungen` | Mehrfach, optional | Bebauungsplan · Flächennutzungsplan · Sanierungsgebiet · Erhaltungssatzung · Stadtumbaugebiet · Denkmalschutz (Bezeichnung ersetzt „formelle Planungsinstrumente“ – überall so verwenden) |
| `gesamtkosten` | Auswahl | weniger als 5.000 € · bis 10.000 € · bis 20.000 € · bis 50.000 € · bis 100.000 € · bis 250.000 € · bis 500.000 € · bis 1.000.000 € · mehr als 1.000.000 € |
| `foerderung` | ja/nein | + `foerderprogramm` (Text, optional) |
| `personeller_aufwand` | Auswahl | hoch · mittel · gering (Ampel; ersetzt frühere Stundenangaben) |
| `projektziel` | Text | ohne Längenbegrenzung |
| Markdown-Inhalt | Fließtext | Projektbeschreibung, ohne Längenbegrenzung |
| `projektfahrplan` | Liste | je Stufe ein Stichpunkt (wird als Zeitleiste gezeigt) |
| `partnerschaften` | Liste | beteiligte Ämter/Partner |
| `hindernisse` | Text, optional | ohne Längenbegrenzung |
| `kontakte` | Liste | Name, Institution, E-Mail, Telefon (nur mit Einwilligung veröffentlichen) |
| `bilder` | Liste | Pfad + Alternativtext (Pflicht) + Bildunterschrift; erstes Bild = Hauptbild |
| `dokumente` | Liste, optional | PDF-Pfade |
| `projekthomepage` | URL, optional | |
| `adresse` | Text, optional | |
| `koordinaten` | `[lat, lng]` | für Karte; Pflicht für Anzeige auf der Karte |
| `im_fokus` | Boolean | „Projekt im Fokus“ auf der Startseite |
| `veroeffentlicht_am` | Datum | Sortierung „Neueste“, Karussell |

Es gibt keine Zeichenbegrenzungen für Textfelder (Entscheidung der Redaktion, Oktober 2026; die Vorgaben aus dem Leistungsverzeichnis entfallen). Ungültige Werte lassen den Build mit verständlicher Meldung abbrechen.

## Glossar (`src/content/glossar/*.md`)

Felder: `begriff`, `kategorie` (Leerstandstyp · Nutzungsart · Projektzweck · Planung & Recht · Projektdaten), Erläuterung als Markdown-Inhalt. Die Kategorie „Projektdaten“ enthält erklärungsbedürftige Feldbegriffe (z. B. Gesamtkosten des Projektes, Personeller Aufwand, Dauer des Leerstands vor Projektstart). Das Glossar ist die **einzige Textquelle** für alle ⓘ-Erläuterungen (Filter, Steckbrief, Formular, Vergleich). Das ⓘ steht neben jedem Begriff, der erläutert werden soll; die Erläuterung erscheint beim Überfahren mit der Maus (zusätzlich per Tastaturfokus und Antippen, Barrierefreiheit). Alle diese Begriffe stehen zusätzlich im Glossar. Fehlt eine Erläuterung, Platzhalter `[Erläuterung folgt]` anzeigen, nichts erfinden. Grundlage der Leerstandstypen ist das Dokument „Kategorisierung_Typen_Leerstand“ der Redaktion.

## Filter (Entdecken, Startseite, Projekt-Finder)

Facetten: Leerstandstyp (`kategorie`) · Nutzungsart · Projektzweck · Leerstandsdauer · Gesamtkosten (Bandbreite) · Förderung (ja/nein) + Freitextsuche (Titel, Stadt, Projektträger). Innerhalb einer Facette ODER, zwischen Facetten UND. Jede Option zeigt ihre Trefferzahl. Die Markerfarbe richtet sich nur nach der Nutzungsart.

Projekt-Finder (3 Fragen in Alltagssprache) setzt intern dieselben Filter: Leerstandsdauer → Nutzungsart → Förderung/Kosten; Ergebnis verlinkt auf `/entdecken/?…`.

## Bestehende Inhalte (Migration)

Diese Projekte stehen aktuell auf kompass-thueringen.de und werden übernommen – Inhalte ausschließlich von der Live-Seite oder von der Redaktion, nicht ergänzen:
Pößneck – Die Stadt als Projektentwickler · Gotha – Umbau eines Wohnblocks zur Jugendherberge · Jena – StadtLab Jena · Schmalkalden – Ratskeller Schmalkalden · Rudolstadt – RuAnSi · Treffurt – Schwebdaer Hof „Hotel 1601“ · Eisenach – „Goldschmiede Eisenach“ · Bad Salzungen – Revitalisierung Bahnhofsgebäude und Bahnhofsumfeld · Arnstadt – Impulsräume Arnstadt · Weimar – Quartiersprojekt Alte Feuerwache · Stadt Amt Creuzburg – Umnutzung ehemaliges Schulgebäude zum Verwaltungssitz

Stand der Übernahme (Oktober 2026): alle 11 Projekte inkl. Bilder übernommen. Kontakte vorerst nicht übernommen (Platzhalter). Koordinaten vorläufig = Stadtmittelpunkt.

Leitfäden (3): Hemmnisse – Chancen und weitere Vorgehensweise bei der Mietförderung · Zwischenerwerb – Voraussetzungen und Bestandteile vom Erwerb bis zur Vermarktung · Zwischenerwerb – Handlungsempfehlung für Kauf, Sicherung, Nachnutzung und Sanierung

Fehlende Felder (z. B. Koordinaten, Ampel, Leerstandsdauer) leer lassen und in `docs/migration-offen.md` je Projekt auflisten.

## Bauplan (Reihenfolge)

1. Grundgerüst: Astro-Projekt, Tokens, Schriften, Layout mit Header/Footer, Deployment auf GitHub Pages
2. Datenmodell + Glossar-Schema, Vorlage-Datei, Migration der Projekte
3. Steckbrief-Vorlage
4. Entdecken mit Filtern und Karte
5. Startseite inkl. Projekt-Finder und Kennzahlen
6. Wissen (Leitfäden + Glossar)
7. Merkliste und Vergleich
8. Projekt einreichen (nach Klärung der Formularfrage)
9. Über KOMPASS, Kontakt, Rechtliches, abschließende Prüfung Barrierefreiheit und Mobilansicht

## Getroffene Entscheidungen (Oktober 2026)

- **Zweck:** Prototyp (Vorlage für die spätere Umsetzung), kein Ersatz der Live-Seite.
- **Formulare:** kein externer Dienst. „Projekt einreichen“ ist ein Assistent mit Zwischenspeichern im Browser (localStorage); „Absenden“ öffnet eine vorausgefüllte E-Mail, zusätzlich können die Angaben als Textdatei gespeichert werden. Empfängeradresse in `src/lib/einreichen.ts` (`EINREICHUNG_EMAIL`, von der Redaktion festzulegen). Kontakt per E-Mail-Link.
- **Newsletter** und **Cookie-Einstellungen** im Footer entfallen (kein Anbieter, keine Cookies).
- **Steckbrief/Vergleich als PDF:** Druckansicht des Browsers.
- **Projekt-Finder:** Fragen 2 und 3 sind ein Vorschlag (`src/lib/projekt-finder.ts`), redaktionelle Abstimmung folgt.

## Offene Entscheidungen – vor Umsetzung nachfragen

- **Zweck:** Prototyp (z. B. als Vorlage für das TYPO3-Büro) oder Ersatz der Live-Seite? Davon hängen Domain, Datenschutztexte und Formularlösung ab.
- **Formulare** (Kontakt, Projekt einreichen): GitHub Pages kann keine Eingaben empfangen. Optionen: externer Formulardienst (Datenschutz prüfen), E-Mail-Link, ausfüllbares PDF des Erfassungsbogens. Nicht eigenmächtig einen Dienst einbinden.
- **Newsletter** im Footer: nur umsetzen, wenn ein Anbieter mit Double-Opt-In feststeht; sonst weglassen.
- **Eigene Domain** und Texte für Impressum, Datenschutz, Barrierefreiheitserklärung liefert die Redaktion.

## Nicht tun

- Keine personenbezogenen Daten oder internen Dokumente ins Repository legen (es ist öffentlich).
- Keine externen Skripte, Fonts, Analytics oder Social-Media-Einbettungen.
- Keine Wertelisten oder Feldbezeichnungen eigenmächtig umbenennen oder ergänzen.
- Gelbe Wireframe-Hinweise nicht auf die Live-Seite übernehmen; sie beschreiben nur Funktionen.
