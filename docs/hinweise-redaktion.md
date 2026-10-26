# Hinweise für die Redaktion

Technische Fakten zum Prototyp als Grundlage für Datenschutzerklärung und Erklärung zur Barrierefreiheit.
Die rechtlichen Texte selbst liefert die Redaktion (`src/content/seiten/impressum.md`, `datenschutz.md`, `barrierefreiheit.md`).

## Datenschutz – was die Website technisch tut

- **Hosting:** GitHub Pages (GitHub Inc.). GitHub verarbeitet beim Aufruf technisch notwendige Daten, u. a. die IP-Adresse (Server-Logs).
- **Keine Cookies, kein Tracking, keine Analyse-Dienste.** Schriften und Skripte werden von der eigenen Website geladen, nicht von fremden Servern.
- **Kartenkacheln:** Auf „Entdecken“ (Kartenansicht) und in der Lagekarte der Steckbriefe werden Kartenbilder von `tile.openstreetmap.org` (OpenStreetMap Foundation) geladen. Dabei wird die IP-Adresse an diesen Server übertragen. Die Karte lädt erst, wenn sie sichtbar wird. Die stilisierte Thüringen-Karte auf der Startseite lädt nichts von außen.
- **Speicherung im Browser (localStorage)** – nur auf dem Gerät der Nutzer:innen, wird nicht übertragen:
  - `kompass-merkliste`: gemerkte Projekte
  - `kompass-vergleich`: Auswahl für den Vergleich (max. 3)
  - `kompass-einreichung`: Zwischenstand des Formulars „Projekt einreichen“ (kann personenbezogene Angaben enthalten, z. B. E-Mail-Adresse; löschbar über „Neu beginnen“ oder die Browser-Einstellungen)
- **Projekt einreichen / Kontakt:** Es gibt keinen Formularserver. Die Angaben werden über das eigene E-Mail-Programm der Nutzer:innen versendet (bzw. als Textdatei gespeichert).
- **Externe Links** (Projekthomepages, AG Leerstandsbewältigung, Stadtentwicklung Thüringen, Handelsstudie) öffnen fremde Websites in einem neuen Fenster.

## Barrierefreiheit – Stand der Prüfung (Oktober 2026)

Ziel: WCAG 2.1 AA / BITV 2.0.

- Automatische Prüfung mit axe-core (WCAG 2.0/2.1 A und AA): **0 Verstöße** auf allen Seitentypen, Desktop (1280 px) und Mobil (390 px), auch in geöffneten Zuständen (Filter-Panel, Filter-Dialog, Galerie, Tooltip, Mobilmenü, Formular mit Fehlermeldungen, Projekt-Finder-Ergebnis).
- Tastaturbedienung geprüft: Navigation, Filter, Karte (Marker per Tab erreichbar), Projekt-Finder, Galerie (Pfeiltasten, Escape), Vergleich, Formular-Assistent; sichtbarer Fokus.
- ⓘ-Erläuterungen erscheinen bei Maus, Tastaturfokus und Antippen und lassen sich mit Escape schließen.
- Ampel „Personeller Aufwand“ und Nutzungsart-Farben immer mit Textlabel.
- Kontrast: Text ≥ 4,5:1. Für Akzenttext auf Sandflächen gibt es den dunkleren Token `--accent-strong`.
- `prefers-reduced-motion`: Laufband steht still, keine Zähl- und Scroll-Animationen. Das Partner-Laufband hat einen Pause-Schalter.
- Keine Prüfung mit echten Screenreadern und keine manuelle BITV-Prüfung durch Sachverständige – vor einer Veröffentlichung empfohlen.
- Bekannte Einschränkung: Alternativtexte der übernommenen Bilder sind aus Bildtiteln/Dateinamen abgeleitet und sollten präzisiert werden (siehe `docs/migration-offen.md`).

## Noch festzulegen

- E-Mail-Adresse der Redaktion: `src/lib/einreichen.ts` (`EINREICHUNG_EMAIL`) und `src/lib/kontakt.ts` (`KONTAKT_EMAIL`)
- Kontaktangaben im Footer, Partnerlogos und Anzahl der Partner
- Texte für Impressum, Datenschutz, Barrierefreiheitserklärung
- Glossar-Erläuterungen (37 Begriffe) und Abstimmung der Projekt-Finder-Fragen 2 und 3
