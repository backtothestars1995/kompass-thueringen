/**
 * Assistent „Projekt einreichen“: Schritte, Prüfung der Pflichtfelder,
 * Zwischenspeichern im Browser (localStorage), Live-Vorschau,
 * Vollständigkeitsanzeige und Übergabe per E-Mail bzw. Textdatei.
 */

const STORAGE_KEY = 'kompass-einreichung';
const MAILTO_MAX = 1800; // längere E-Mail-Links schneiden manche Programme ab

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(sel),
];

const NUTZUNG_VAR: Record<string, string> = {
  Gewerbe: '--use-gewerbe',
  Wohnen: '--use-wohnen',
  Mischnutzung: '--use-mischnutzung',
  Sondernutzung: '--use-sondernutzung',
};

// Beschriftungen für Zusammenfassung und E-Mail (Reihenfolge = Formular)
const FELDER: { name: string; label: string; schritt: number }[] = [
  { name: 'titel', label: 'Projekttitel', schritt: 0 },
  { name: 'stadt', label: 'Stadt / Kommune', schritt: 0 },
  { name: 'einwohnerzahl', label: 'Einwohnerzahl', schritt: 0 },
  { name: 'projekttraeger', label: 'Projektträger', schritt: 0 },
  { name: 'eigentuemerstruktur', label: 'Eigentümerstruktur vor Projektstart', schritt: 0 },
  { name: 'projektzweck', label: 'Projektzweck', schritt: 1 },
  { name: 'kategorie', label: 'Kategorie (Leerstandstyp)', schritt: 1 },
  { name: 'nutzungsart', label: 'Nutzungsart nach Projektabschluss', schritt: 1 },
  { name: 'leerstandsdauer', label: 'Dauer des Leerstands vor Projektstart', schritt: 1 },
  { name: 'planungsinstrumente_informell', label: 'Planungsinstrumente (informell)', schritt: 2 },
  { name: 'rechtliche_rahmenbedingungen', label: 'Rechtliche Rahmenbedingungen', schritt: 2 },
  { name: 'zeitraum_beginn', label: 'Zeitraum – Beginn', schritt: 3 },
  { name: 'zeitraum_ende', label: 'Zeitraum – Ende', schritt: 3 },
  { name: 'projektziel', label: 'Projektziel', schritt: 3 },
  { name: 'beschreibung', label: 'Projektbeschreibung', schritt: 3 },
  { name: 'projektfahrplan', label: 'Projektfahrplan', schritt: 3 },
  { name: 'partnerschaften', label: 'Partnerschaften', schritt: 3 },
  { name: 'personeller_aufwand', label: 'Personeller Aufwand', schritt: 4 },
  { name: 'gesamtkosten', label: 'Gesamtkosten des Projektes', schritt: 4 },
  { name: 'foerderung', label: 'Förderung erhalten', schritt: 4 },
  { name: 'foerderprogramm', label: 'Förderprogramm', schritt: 4 },
  { name: 'hindernisse', label: 'Hindernisse & wichtige Hinweise', schritt: 4 },
  { name: 'projekthomepage', label: 'Projekthomepage', schritt: 5 },
  { name: 'adresse', label: 'Adresse des Objekts', schritt: 5 },
  { name: 'kontakt_name', label: 'Kontakt – Name', schritt: 5 },
  { name: 'kontakt_institution', label: 'Kontakt – Institution', schritt: 5 },
  { name: 'kontakt_email', label: 'Kontakt – E-Mail', schritt: 5 },
  { name: 'kontakt_telefon', label: 'Kontakt – Telefon', schritt: 5 },
  { name: 'kontakt_einwilligung', label: 'Einwilligung Veröffentlichung Kontaktdaten', schritt: 5 },
  { name: 'email_rueckfragen', label: 'E-Mail für Rückfragen', schritt: 5 },
  { name: 'einverstaendnis', label: 'Einverständnis Bild- und Textnutzung', schritt: 5 },
];

// Felder, die in die Vollständigkeit eingehen
const VOLLSTAENDIG = [
  'titel', 'stadt', 'einwohnerzahl', 'projekttraeger', 'eigentuemerstruktur', 'projektzweck', 'kategorie', 'nutzungsart',
  'leerstandsdauer', 'planungsinstrumente_informell', 'rechtliche_rahmenbedingungen', 'zeitraum_beginn', 'projektziel',
  'beschreibung', 'projektfahrplan', 'partnerschaften', 'personeller_aufwand', 'gesamtkosten', 'foerderung', 'hindernisse',
  'bilder', 'email_rueckfragen',
];

const SCHRITTE = ['Basisdaten', 'Einordnung', 'Planung', 'Beschreibung', 'Aufwand & Kosten', 'Medien & Kontakt'];

export function initEinreichen() {
  const rootEl = $('[data-assistent]');
  const formEl = $<HTMLFormElement>('[data-formular]');
  if (!rootEl || !formEl) return;
  const root: HTMLElement = rootEl;
  const form: HTMLFormElement = formEl;

  const steps = $$('[data-step]', form);
  const stepBtns = $$<HTMLButtonElement>('[data-schritt-btn]');
  const weiter = $<HTMLButtonElement>('[data-weiter]', form)!;
  const zurueck = $<HTMLButtonElement>('[data-zurueck]', form)!;
  const speicherstatus = $('[data-speicherstatus]')!;
  let aktuell = 0;
  const besucht = new Set<number>([0]);

  // ── Werte lesen ──────────────────────────────────────────────────────
  const werte = (name: string): string[] =>
    $$<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`, form)
      .filter((el) => (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio') ? el.checked : true))
      .filter((el) => !(el instanceof HTMLInputElement && el.type === 'file'))
      .map((el) => el.value.trim())
      .filter(Boolean);
  const wert = (name: string) => werte(name).join(', ');
  const dateien = (name: string) => [...($<HTMLInputElement>(`[name="${name}"]`, form)?.files ?? [])];

  // ── Prüfung ──────────────────────────────────────────────────────────
  let anzeigen = true;
  function fehler(name: string, text: string) {
    if (!anzeigen) return text ? name : null;
    const el = $(`[data-fehler-fuer="${name}"]`, form);
    if (el) el.textContent = text;
    $$(`[name="${name}"]`, form).forEach((i) => (text ? i.setAttribute('aria-invalid', 'true') : i.removeAttribute('aria-invalid')));
    return text ? name : null;
  }

  function pruefe(schritt: number): string[] {
    const fehlerListe: (string | null)[] = [];
    const pflicht = (name: string, text: string) => fehlerListe.push(fehler(name, wert(name) ? '' : text));
    if (schritt === 0) {
      pflicht('titel', 'Bitte geben Sie einen Projekttitel ein.');
      pflicht('stadt', 'Bitte geben Sie die Stadt oder Kommune an.');
      pflicht('projekttraeger', 'Bitte geben Sie den Projektträger an.');
    }
    if (schritt === 1) {
      pflicht('projektzweck', 'Bitte wählen Sie mindestens einen Projektzweck.');
      pflicht('kategorie', 'Bitte wählen Sie mindestens eine Kategorie – oder „Weiß ich nicht“.');
      pflicht('nutzungsart', 'Bitte wählen Sie mindestens eine Nutzungsart.');
    }
    if (schritt === 3) {
      const beginn = Number(wert('zeitraum_beginn'));
      const ende = wert('zeitraum_ende') ? Number(wert('zeitraum_ende')) : null;
      fehlerListe.push(
        fehler('zeitraum_beginn', !beginn ? 'Bitte geben Sie das Jahr des Projektbeginns an.' : beginn < 1900 || beginn > 2100 ? 'Bitte eine vierstellige Jahreszahl eingeben.' : ''),
      );
      fehlerListe.push(fehler('zeitraum_ende', ende !== null && beginn && ende < beginn ? 'Das Ende liegt vor dem Beginn.' : ''));
    }
    if (schritt === 5) {
      const mail = wert('email_rueckfragen');
      fehlerListe.push(
        fehler('email_rueckfragen', !mail ? 'Bitte geben Sie eine E-Mail-Adresse für Rückfragen an.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? '' : 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
      );
      const hp = wert('projekthomepage');
      let hpOk = true;
      try {
        if (hp) new URL(hp);
      } catch {
        hpOk = false;
      }
      fehlerListe.push(fehler('projekthomepage', hpOk ? '' : 'Bitte eine vollständige Adresse eingeben, z. B. https://www.beispiel.de'));
      fehlerListe.push(fehler('einverstaendnis', wert('einverstaendnis') ? '' : 'Bitte bestätigen Sie das Einverständnis.'));
      for (const name of ['bilder', 'dokumente']) {
        const input = $<HTMLInputElement>(`[name="${name}"]`, form)!;
        const maxMb = Number(input.dataset.dateiMax);
        const zuGross = dateien(name).filter((f) => f.size > maxMb * 1024 * 1024);
        fehlerListe.push(fehler(name, zuGross.length ? `Zu groß (höchstens ${maxMb} MB): ${zuGross.map((f) => f.name).join(', ')}` : ''));
      }
    }
    return fehlerListe.filter((x): x is string => !!x);
  }

  // ── Schritte ─────────────────────────────────────────────────────────
  function zeige(i: number, fokus = true) {
    aktuell = i;
    besucht.add(i);
    steps.forEach((s, n) => (s.hidden = n !== i));
    stepBtns.forEach((b, n) => {
      b.classList.toggle('is-aktuell', n === i);
      const fertig = n !== i && besucht.has(n) && pruefeStill(n);
      b.classList.toggle('is-fertig', fertig);
      if (n === i) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
      b.querySelector('[data-schritt-status]')!.textContent = n === i ? ' (aktueller Schritt)' : fertig ? ' (erledigt)' : '';
    });
    $('[data-fortschritt]')!.style.width = `${((i + 0.5) / steps.length) * 100}%`;
    zurueck.disabled = i === 0;
    zurueck.textContent = i > 0 ? `← Zurück: ${SCHRITTE[i - 1]}` : '← Zurück';
    weiter.hidden = i === steps.length - 1;
    if (i < steps.length - 1) weiter.textContent = `Weiter: ${SCHRITTE[i + 1]} →`;
    if (fokus) {
      $<HTMLElement>('.step__titel', steps[i])?.focus();
      window.scrollTo({ top: 0 });
    }
  }

  // Prüft ohne Fehlermeldungen anzuzeigen (für Häkchen in der Schrittleiste)
  function pruefeStill(schritt: number): boolean {
    anzeigen = false;
    const ok = pruefe(schritt).length === 0;
    anzeigen = true;
    return ok;
  }

  function fokusFehler(namen: string[]) {
    const el = $<HTMLElement>(`[name="${namen[0]}"]`, form);
    el?.focus();
  }

  weiter.addEventListener('click', () => {
    const f = pruefe(aktuell);
    if (f.length) return fokusFehler(f);
    zeige(aktuell + 1);
  });
  zurueck.addEventListener('click', () => zeige(aktuell - 1));
  stepBtns.forEach((b, i) => b.addEventListener('click', () => zeige(i)));

  // ── Zwischenspeichern ────────────────────────────────────────────────
  function sammle(): Record<string, string[]> {
    const daten: Record<string, string[]> = {};
    for (const f of FELDER) daten[f.name] = werte(f.name);
    return daten;
  }
  let speicherTimer: number | undefined;
  function speichern(meldung = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ daten: sammle(), schritt: aktuell }));
      const zeit = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      speicherstatus.textContent = meldung
        ? `Zwischengespeichert um ${zeit} Uhr – in diesem Browser. Bilder und Dokumente bitte später erneut auswählen.`
        : `Automatisch gespeichert um ${zeit} Uhr.`;
    } catch {
      speicherstatus.textContent = 'Zwischenspeichern ist in diesem Browser nicht möglich.';
    }
  }
  function laden(): number | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const { daten, schritt } = JSON.parse(raw) as { daten: Record<string, string[]>; schritt: number };
      let etwas = false;
      for (const [name, vals] of Object.entries(daten)) {
        $$<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`, form).forEach((el) => {
          if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) el.checked = vals.includes(el.value);
          else if (!(el instanceof HTMLInputElement && el.type === 'file')) el.value = vals[0] ?? '';
        });
        if (vals.length) etwas = true;
      }
      return etwas ? schritt : null;
    } catch {
      return null;
    }
  }
  $('[data-speichern]')!.addEventListener('click', () => speichern(true));
  $('[data-neu-beginnen]', form)?.addEventListener('click', () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* egal */
    }
    form.reset();
    $('[data-wiederhergestellt]', form)!.hidden = true;
    besucht.clear();
    aktualisiere();
    zeige(0);
  });

  // ── Dateien ──────────────────────────────────────────────────────────
  const vorschauUrls: string[] = [];
  function dateilisten() {
    vorschauUrls.splice(0).forEach((u) => URL.revokeObjectURL(u));
    for (const name of ['bilder', 'dokumente']) {
      const liste = $(`[data-dateiliste="${name}"]`, form)!;
      liste.replaceChildren(
        ...dateien(name).map((f) => {
          const li = document.createElement('li');
          if (name === 'bilder' && f.type.startsWith('image/')) {
            const img = document.createElement('img');
            const u = URL.createObjectURL(f);
            vorschauUrls.push(u);
            img.src = u;
            img.alt = '';
            li.append(img);
          }
          li.append(`${f.name} (${(f.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB)`);
          return li;
        }),
      );
    }
  }

  // ── Live-Vorschau & Vollständigkeit ──────────────────────────────────
  const KURZ: Record<string, string> = {
    'Zwischennutzung eines leerstehenden Objektes': 'Zwischennutzung',
    'Dauerhafte Nutzung eines leerstehenden Objektes': 'Dauerhafte Nutzung',
    'Umnutzung eines leerstehenden Objektes': 'Umnutzung',
  };
  let titelbildUrl: string | undefined;
  function aktualisiere() {
    $('[data-v-titel]')!.textContent = wert('titel') || '[Ihr Projekttitel aus Schritt 1]';
    $('[data-v-ort]')!.textContent = `${wert('stadt') || '[Ihre Stadt]'} · ${wert('einwohnerzahl') ? `${wert('einwohnerzahl')} EW` : '[Einwohnerklasse]'}`;
    $('[data-v-zweck]')!.textContent = werte('projektzweck').map((z) => KURZ[z] ?? z).join(' · ');
    const nutzung = werte('nutzungsart')[0];
    $('[data-v-badge]')!.hidden = !nutzung;
    if (nutzung) {
      $('[data-v-nutzung]')!.textContent = nutzung;
      $('[data-v-dot]')!.style.background = `var(${NUTZUNG_VAR[nutzung]})`;
    }
    const bild = dateien('bilder')[0];
    if (titelbildUrl) URL.revokeObjectURL(titelbildUrl);
    titelbildUrl = bild ? URL.createObjectURL(bild) : undefined;
    $('[data-v-bild]')!.style.backgroundImage = titelbildUrl ? `url("${titelbildUrl}")` : '';
    $('[data-v-bild-platzhalter]')!.hidden = !!bild;

    const gefuellt = VOLLSTAENDIG.filter((n) => (n === 'bilder' ? dateien(n).length > 0 : !!wert(n))).length;
    const prozent = Math.round((gefuellt / VOLLSTAENDIG.length) * 100);
    $('[data-v-prozent]')!.textContent = `${prozent} %`;
    const balken = $('[data-v-balken]')!;
    balken.setAttribute('aria-valuenow', String(prozent));
    (balken.firstElementChild as HTMLElement).style.width = `${prozent}%`;

    $('[data-nur-bei-foerderung]', form)!.hidden = wert('foerderung') !== 'ja';
  }

  // Fehlermeldung eines Feldes verschwindet, sobald es ausgefüllt ist
  function fehlerZuruecksetzen(e: Event) {
    const name = (e.target as HTMLInputElement).name;
    const meldung = name ? $(`[data-fehler-fuer="${name}"]`, form) : null;
    if (meldung?.textContent && wert(name)) fehler(name, '');
  }

  form.addEventListener('input', (e) => {
    fehlerZuruecksetzen(e);
    aktualisiere();
    clearTimeout(speicherTimer);
    speicherTimer = window.setTimeout(() => speichern(), 800);
  });
  form.addEventListener('change', (e) => {
    fehlerZuruecksetzen(e);
    if ((e.target as HTMLInputElement).type === 'file') dateilisten();
    aktualisiere();
  });

  // ── Absenden ─────────────────────────────────────────────────────────
  function zusammenfassung(): string {
    const zeilen = ['Projektvorschlag für den KOMPASS Thüringen', ''];
    SCHRITTE.forEach((s, i) => {
      zeilen.push(`== ${i + 1}. ${s} ==`);
      for (const f of FELDER.filter((f) => f.schritt === i)) {
        const v = werte(f.name);
        if (!v.length) continue;
        const text = v.join(', ');
        zeilen.push(text.includes('\n') ? `${f.label}:\n${text}` : `${f.label}: ${text}`);
      }
      if (i === 5) {
        const b = dateien('bilder').map((f) => f.name);
        const d = dateien('dokumente').map((f) => f.name);
        if (b.length) zeilen.push(`Bilder (bitte anhängen): ${b.join(', ')}`);
        if (d.length) zeilen.push(`Dokumente (bitte anhängen): ${d.join(', ')}`);
      }
      zeilen.push('');
    });
    return zeilen.join('\n');
  }

  function herunterladen() {
    const blob = new Blob([zusammenfassung()], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kompass-projektvorschlag-${(wert('stadt') || 'projekt').toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-')}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const absendenStatus = $('[data-absenden-status]', form)!;
  $('[data-herunterladen]', form)!.addEventListener('click', () => {
    herunterladen();
    absendenStatus.textContent = 'Die Textdatei mit Ihren Angaben wurde gespeichert.';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    for (let i = 0; i < steps.length; i++) {
      const f = pruefe(i);
      if (f.length) {
        if (i !== aktuell) zeige(i, false);
        absendenStatus.textContent = '';
        return fokusFehler(f);
      }
    }
    const email = root.dataset.email ?? '';
    const betreff = root.dataset.betreff ?? '';
    let body = zusammenfassung();
    if (encodeURIComponent(body).length > MAILTO_MAX) {
      herunterladen();
      body =
        'Guten Tag,\n\nanbei sende ich einen Projektvorschlag für den KOMPASS Thüringen. ' +
        'Die vollständigen Angaben finden Sie in der angehängten Textdatei.\n\n' +
        `Projekt: ${wert('titel')} (${wert('stadt')})\nE-Mail für Rückfragen: ${wert('email_rueckfragen')}\n`;
      absendenStatus.textContent =
        'Ihre Angaben sind zu umfangreich für einen E-Mail-Link. Wir haben sie als Textdatei gespeichert – bitte hängen Sie die Datei (und Ihre Bilder) an die E-Mail an.';
    } else {
      absendenStatus.textContent = 'Ihr E-Mail-Programm wird geöffnet. Bitte Bilder und Dokumente anhängen und die E-Mail absenden.';
    }
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(body)}`;
  });

  // ── Start ────────────────────────────────────────────────────────────
  const gespeichert = laden();
  if (gespeichert !== null) {
    $('[data-wiederhergestellt]', form)!.hidden = false;
    for (let i = 0; i <= gespeichert; i++) besucht.add(i);
  }
  aktualisiere();
  zeige(gespeichert ?? 0, false);
}
