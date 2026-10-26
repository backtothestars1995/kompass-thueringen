# KOMPASS Thüringen – Website (Variante 2)

Prototyp der neu konzipierten Website des KOMPASS Thüringen, umgesetzt als statische Website mit [Astro](https://astro.build).
Grundlage sind die Wireframes und das Leistungsverzeichnis in `docs/`. Hinweise für die Entwicklung stehen in `CLAUDE.md`.

## Veröffentlichung

Jede Änderung auf dem Branch `main` wird automatisch über GitHub Actions auf GitHub Pages veröffentlicht:
https://backtothestars1995.github.io/kompass-thueringen/

Einmalig nötig: im Repository unter **Settings → Pages → Build and deployment → Source** „GitHub Actions“ auswählen.

## Inhalte pflegen (ohne Programmierkenntnisse)

Alle Inhalte sind Textdateien im Ordner `src/content/` und lassen sich direkt im GitHub-Webinterface bearbeiten
(Datei öffnen → Stift-Symbol → ändern → „Commit changes“). Nach dem Speichern wird die Website automatisch neu gebaut.

| Was | Wo | Hinweis |
|---|---|---|
| Projekte | `src/content/projekte/*.md` | Vorlage: `_vorlage.md` (erklärt jedes Feld). Bilder in `src/content/projekte/bilder/<projekt>/` |
| Glossar (ⓘ-Erläuterungen) | `src/content/glossar/*.md` | Text unter dem zweiten `---` eintragen |
| Leitfäden | `src/content/leitfaeden/*.md` | PDFs in `public/dokumente/leitfaeden/` |
| Seiten (Idee, Rechtliches) | `src/content/seiten/*.md` | |
| Projekt im Fokus | im Projekt `im_fokus: true` setzen | sonst wird das neueste Projekt gezeigt |

Ist eine Angabe ungültig (z. B. falsche Schreibweise eines Auswahlwerts), bricht die Veröffentlichung ab. Die Fehlermeldung
im Reiter **Actions** nennt Datei, Feld und die erlaubten Werte.

Offene Inhalte: `docs/migration-offen.md` · Technische Hinweise zu Datenschutz und Barrierefreiheit: `docs/hinweise-redaktion.md`

## Seiten

Startseite · Entdecken (Filter, Liste, Karte) · Projekt-Steckbriefe · Merkliste & Vergleich · Wissen (Leitfäden, Leerstands-ABC) ·
Projekt einreichen (Assistent) · Über KOMPASS · Kontakt · Impressum · Datenschutz · Barrierefreiheit

## Lokal entwickeln (optional)

Voraussetzung: Node.js ab Version 22.23 (empfohlen 24, siehe `.nvmrc`).

```sh
npm install
npm run dev      # Entwicklungsserver
npm run build    # prüft Inhalte und Typen, baut die Seite nach dist/
npm run preview  # gebaute Seite ansehen
```
