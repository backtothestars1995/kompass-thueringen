# KOMPASS Thüringen – Website (Variante 2)

Prototyp der neu konzipierten Website des KOMPASS Thüringen, umgesetzt als statische Website mit [Astro](https://astro.build).
Grundlage sind die Wireframes und das Leistungsverzeichnis in `docs/`. Hinweise für die Entwicklung stehen in `CLAUDE.md`.

## Veröffentlichung

Jede Änderung auf dem Branch `main` wird automatisch über GitHub Actions auf GitHub Pages veröffentlicht:
https://backtothestars1995.github.io/kompass-thueringen/

Einmalig nötig: im Repository unter **Settings → Pages → Build and deployment → Source** „GitHub Actions“ auswählen.

## Lokal entwickeln (optional)

Voraussetzung: Node.js ab Version 22.23 (empfohlen 24, siehe `.nvmrc`).

```sh
npm install
npm run dev      # Entwicklungsserver
npm run build    # prüft Inhalte und Typen, baut die Seite nach dist/
npm run preview  # gebaute Seite ansehen
```
