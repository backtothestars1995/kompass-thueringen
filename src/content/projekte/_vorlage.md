---
# ════════════════════════════════════════════════════════════════════
#  VORLAGE FÜR EIN NEUES PROJEKT
# ════════════════════════════════════════════════════════════════════
#  So legen Sie ein neues Projekt an (im GitHub-Webinterface):
#   1. Diese Datei öffnen, Inhalt komplett kopieren.
#   2. Im Ordner src/content/projekte auf „Add file → Create new file“.
#   3. Dateiname = spätere Adresse, klein und ohne Umlaute,
#      z. B. „ruansi-rudolstadt.md“ → /projekte/ruansi-rudolstadt/
#   4. Inhalt einfügen, Werte ausfüllen, „Commit changes“.
#
#  Regeln:
#   • Zeilen mit # sind Hinweise und werden ignoriert.
#   • Texte mit Doppelpunkt oder Anführungszeichen in "…" setzen.
#   • Bei Auswahlfeldern genau die angegebene Schreibweise verwenden
#     (bei Mehrfachauswahl je Wert eine Zeile mit „  - “).
#   • Optionale Felder können leer bleiben oder ganz gelöscht werden.
#   • Ist etwas falsch, bricht die Veröffentlichung ab und nennt im
#     Protokoll (Reiter „Actions“) Feld und Fehler.
#   • Diese Vorlage selbst wird nicht veröffentlicht (Name beginnt mit _).
# ════════════════════════════════════════════════════════════════════

# ── 1. Basisdaten ───────────────────────────────────────────────────
titel: "Titel des Projekts"                 # Pflicht
stadt: "Stadt"                              # Pflicht
einwohnerzahl: "10.001–25.000"
#   0–10.000 · 10.001–25.000 · 25.001–50.000 · 50.001–100.000 · ab 100.001
projekttraeger: "Name des Projektträgers"   # Pflicht
eigentuemerstruktur:                        # optional, Mehrfachauswahl
  - Kommunal
#   Kommunal · Privat · Erbengemeinschaft · Investor ·
#   Privates Wohnungsunternehmen · Kommunales Wohnungsunternehmen · Unbekannt

# ── 2. Einordnung ───────────────────────────────────────────────────
projektzweck:                               # Mehrfachauswahl
  - Vermarktung leerstehender Objekte
#   Vermarktung leerstehender Objekte
#   Zwischennutzung eines leerstehenden Objektes
#   Dauerhafte Nutzung eines leerstehenden Objektes
#   Umnutzung eines leerstehenden Objektes

kategorie:                                  # Leerstandstyp, Mehrfachauswahl
  - Struktureller Leerstand
#   Struktureller Leerstand · Konjunktureller Leerstand ·
#   Fluktuations- / Übergangsleerstand · Eigentümerbedingter Leerstand ·
#   Funktionaler Leerstand · Temporärer / strategischer Leerstand ·
#   Spekulativer Leerstand · Nutzungsbedingter Leerstand (branchenbezogen) ·
#   Herrenloses Grundstück

nutzungsart:                                # nach Projektabschluss, Mehrfachauswahl
  - Gewerbe                                 # der erste Wert bestimmt die Kartenfarbe
#   Gewerbe · Wohnen · Mischnutzung · Sondernutzung

leerstandsdauer:                            # vor Projektstart, optional
  - mittelfristig (3–5 Jahre)
#   kurzfristig (1–2 Jahre) · mittelfristig (3–5 Jahre) · langfristig (über 5 Jahre)

# ── 3. Planung ──────────────────────────────────────────────────────
planungsinstrumente_informell:              # optional, Mehrfachauswahl
  - Integriertes Stadtentwicklungskonzept
#   Integriertes Stadtentwicklungskonzept · Wohnraumentwicklungskonzept ·
#   Gewerbeflächenentwicklungskonzept · Innenstadtkonzept ·
#   Quartiersentwicklungskonzept · Städtebaulicher Rahmenplan

rechtliche_rahmenbedingungen:               # optional, Mehrfachauswahl
  - Sanierungsgebiet
#   Bebauungsplan · Flächennutzungsplan · Sanierungsgebiet ·
#   Erhaltungssatzung · Stadtumbaugebiet · Denkmalschutz

# ── 4. Beschreibung & Zeitplan ──────────────────────────────────────
zeitraum:
  beginn: 2024                              # Pflicht, Jahreszahl
  # ende: 2025                              # leer lassen = Projekt läuft noch

projektziel: "Ein Satz zum Ziel des Projekts (höchstens 250 Zeichen)."

projektfahrplan:                            # je Stufe ein Stichpunkt → Zeitleiste
  - "Erste Stufe"
  - "Zweite Stufe"

partnerschaften:                            # beteiligte Ämter und Partner
  - "Name des Partners"

# ── 5. Aufwand, Kosten & Förderung ──────────────────────────────────
personeller_aufwand: mittel                 # hoch · mittel · gering
gesamtkosten: "bis 50.000 €"
#   weniger als 5.000 € · bis 10.000 € · bis 20.000 € · bis 50.000 € ·
#   bis 100.000 € · bis 250.000 € · bis 500.000 € · bis 1.000.000 € ·
#   mehr als 1.000.000 €
foerderung: true                            # true = ja, false = nein
foerderprogramm: "Name des Förderprogramms" # optional

hindernisse: "Erfahrungen für Nachahmer (optional, höchstens 1.500 Zeichen)."

# ── 6. Medien & Kontakt ─────────────────────────────────────────────
bilder:                                     # erstes Bild = Hauptbild
#  Bilder in den Ordner src/content/projekte/bilder/<dateiname-des-projekts>/ hochladen.
#  - pfad: ./bilder/titel-des-projekts/hauptbild.jpg
#    alt: "Was ist auf dem Bild zu sehen? (Pflicht, für blinde Menschen)"
#    bildunterschrift: "Optionale Bildunterschrift"

dokumente:                                  # optional, PDFs in public/dokumente/ ablegen
#  - /dokumente/titel-des-projekts.pdf

projekthomepage: "https://www.beispiel.de"  # optional
adresse: "Straße Nr., PLZ Ort"              # optional

koordinaten: [50.9787, 11.0328]             # [Breitengrad, Längengrad] – nötig für die Karte
#   Tipp: Ort auf openstreetmap.org suchen, Rechtsklick → „Adresse anzeigen“

kontakte:                                   # nur mit Einwilligung der Person veröffentlichen!
  - name: "Vorname Nachname"
    institution: "Institution"
    email: "name@beispiel.de"
    telefon: "0361 000000"

# ── Redaktion ───────────────────────────────────────────────────────
im_fokus: false                             # true = „Projekt im Fokus“ auf der Startseite
veroeffentlicht_am: 2026-10-26              # Datum der Veröffentlichung (JJJJ-MM-TT)
---

Hier steht die Projektbeschreibung als Fließtext (höchstens 2.500 Zeichen).

Absätze werden durch eine Leerzeile getrennt. **Fett** und *kursiv* sind möglich.
