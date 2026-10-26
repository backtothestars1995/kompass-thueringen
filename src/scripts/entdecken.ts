/**
 * Entdecken: Filter, Trefferzahlen, Sortierung, URL-Zustand, Karte mit
 * Marker-Clustern, Hover-Kopplung Karte ↔ Liste und Vergleichsleiste.
 */
import {
  FACETTEN,
  KOSTEN_MAX,
  anzahlAktiv,
  chipLabel,
  kostenAktiv,
  leererZustand,
  passt,
  sortiere,
  trefferJeOption,
  zustandAusUrl,
  zustandZuParams,
  type Ansicht,
  type FilterProjekt,
  type FilterZustand,
  type ListenFacette,
  type Sortierung,
} from '../lib/filter';
import { GESAMTKOSTEN } from '../lib/taxonomie';
import { getVergleich, onVergleichChange } from '../lib/vergleich';
import type * as Leaflet from 'leaflet';

const SEITE = 12; // Projekte pro „Seite“ (Weitere Projekte anzeigen)

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(sel),
];

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function initEntdecken() {
  const root = $('[data-entdecken]');
  if (!root) return;

  const projekte: FilterProjekt[] = JSON.parse($('[data-projekte]')!.textContent || '[]');
  const bySlug = new Map(projekte.map((p) => [p.slug, p]));
  const params = new URLSearchParams(location.search);
  let z: FilterZustand = zustandAusUrl(params);
  let sichtbar = SEITE;
  const fokusProjekt = params.get('projekt');
  if (fokusProjekt && bySlug.has(fokusProjekt) && !params.get('ansicht')) z.ansicht = 'karte';

  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const mobil = window.matchMedia('(max-width: 760px)');

  // ── Elemente ──────────────────────────────────────────────────────────
  const suche = $<HTMLInputElement>('#suche')!;
  const sortSelect = $<HTMLSelectElement>('[data-sort]')!;
  const liste = $('[data-liste]')!;
  const items = new Map($$('[data-item]').map((li) => [li.dataset.item!, li]));
  const ergebnisse = $('[data-ergebnisse]')!;
  const sheet = $<HTMLDialogElement>('[data-sheet]')!;
  const boundsCheckbox = $<HTMLInputElement>('[data-bounds]')!;

  // ── Karte (wird erst geladen, wenn sie sichtbar ist) ─────────────────
  let map: Leaflet.Map | undefined;
  let cluster: Leaflet.MarkerClusterGroup | undefined;
  let L: typeof Leaflet | undefined;
  let iconFn: ((farbe: string, aktiv?: boolean) => Leaflet.DivIcon) | undefined;
  let farbeFn: ((n: string | undefined) => string) | undefined;
  const markers = new Map<string, Leaflet.Marker>();
  let kartenBounds: Leaflet.LatLngBounds | undefined;

  const karteSichtbar = () => {
    const modus = effektiveAnsicht();
    return modus === 'karte' || (modus === 'beides' && !mobil.matches);
  };

  let laedt = false;
  async function karteLaden() {
    if (map || laedt || !karteSichtbar()) return;
    laedt = true;
    const mod = await import('./karte');
    await import('leaflet.markercluster');
    L = mod.L;
    iconFn = mod.markerIcon;
    farbeFn = mod.nutzungsFarbe;
    map = mod.createMap($('[data-karte]')!, { zoomControl: false });
    L.control.zoom({ position: 'topright', zoomInTitle: 'Hineinzoomen', zoomOutTitle: 'Herauszoomen' }).addTo(map);
    map.fitBounds(mod.THUERINGEN_BOUNDS);
    cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45,
      iconCreateFunction: (c) =>
        L!.divIcon({
          html: `<span class="kompass-cluster">${c.getChildCount()}</span>`,
          className: 'kompass-cluster-wrap',
          iconSize: [40, 40],
        }),
    });
    for (const p of projekte) {
      if (!p.koordinaten) continue;
      const farbe = farbeFn(p.nutzungsart[0]);
      const marker = L.marker(p.koordinaten, {
        icon: iconFn(farbe),
        title: `${p.stadt}: ${p.titel}`,
        alt: `${p.stadt}: ${p.titel}`,
        riseOnHover: true,
      });
      marker.bindPopup(() => popupHtml(p), { maxWidth: 260, minWidth: 220 });
      marker.on('mouseover', () => markiereKarte(p.slug, true));
      marker.on('mouseout', () => markiereKarte(p.slug, false));
      markers.set(p.slug, marker);
    }
    map.addLayer(cluster);
    map.on('moveend', () => {
      if (boundsCheckbox.checked) {
        kartenBounds = map!.getBounds();
        render({ karte: false });
      }
    });
    render({ url: false });
    if (fokusProjekt && markers.has(fokusProjekt)) {
      const m = markers.get(fokusProjekt)!;
      cluster.zoomToShowLayer(m, () => m.openPopup());
    } else {
      zoomAufTreffer();
    }
  }

  function popupHtml(p: FilterProjekt): string {
    const n = p.nutzungsart[0];
    const bild = p.bild ? `<img src="${p.bild}" alt="" class="kpopup__bild" loading="lazy">` : '';
    const badge = n
      ? `<span class="kpopup__badge"><span class="kpopup__dot" style="--dot:${farbeFn!(n)}"></span>${escapeHtml(n)}</span>`
      : '';
    return `<div class="kpopup">${bild}<div class="kpopup__text">${badge}<p class="kpopup__ort">${escapeHtml(p.stadt)}</p><a class="kpopup__titel" href="${base}projekte/${p.slug}/">${escapeHtml(p.titel)}</a></div></div>`;
  }

  function aktualisiereMarker(treffer: Set<string>) {
    if (!cluster) return;
    for (const [slug, m] of markers) {
      const soll = treffer.has(slug);
      const ist = cluster.hasLayer(m);
      if (soll && !ist) cluster.addLayer(m);
      if (!soll && ist) cluster.removeLayer(m);
    }
  }

  function zoomAufTreffer() {
    if (!map || !L) return;
    const pts = [...markers].filter(([, m]) => cluster!.hasLayer(m)).map(([, m]) => m.getLatLng());
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 12 });
  }

  // Hover-Kopplung: Karte ↔ Liste
  function markiereKarte(slug: string, an: boolean) {
    items.get(slug)?.querySelector('.pcard')?.classList.toggle('is-highlighted', an);
  }
  function markiereMarker(slug: string, an: boolean) {
    const m = markers.get(slug);
    const p = bySlug.get(slug);
    if (!m || !p || !iconFn || !farbeFn) return;
    m.setIcon(iconFn(farbeFn(p.nutzungsart[0]), an));
    m.setZIndexOffset(an ? 1000 : 0);
  }
  for (const [slug, li] of items) {
    li.addEventListener('mouseenter', () => markiereMarker(slug, true));
    li.addEventListener('mouseleave', () => markiereMarker(slug, false));
    li.addEventListener('focusin', () => markiereMarker(slug, true));
    li.addEventListener('focusout', () => markiereMarker(slug, false));
  }

  // ── Darstellung ──────────────────────────────────────────────────────
  function effektiveAnsicht(): Ansicht {
    return mobil.matches && z.ansicht === 'beides' ? 'liste' : z.ansicht;
  }

  function render({ url = true, karte = true }: { url?: boolean; karte?: boolean } = {}) {
    // Treffer
    let treffer = projekte.filter((p) => passt(p, z));
    if (boundsCheckbox.checked && kartenBounds) {
      const b = kartenBounds;
      treffer = treffer.filter((p) => p.koordinaten && b.contains(p.koordinaten));
    }
    const sortiert = sortiere(treffer, z.sort);
    const trefferSet = new Set(sortiert.map((p) => p.slug));

    // Liste: Reihenfolge, Sichtbarkeit, Seitenweise
    sortiert.forEach((p, i) => {
      const li = items.get(p.slug)!;
      liste.appendChild(li);
      li.hidden = i >= sichtbar;
    });
    for (const [slug, li] of items) if (!trefferSet.has(slug)) li.hidden = true;
    $('[data-mehr]')!.hidden = sortiert.length <= sichtbar;
    $('[data-leer]')!.hidden = sortiert.length > 0;

    // Zahlen
    $$('[data-treffer]').forEach((el) => (el.textContent = String(sortiert.length)));
    for (const f of FACETTEN) {
      const counts = trefferJeOption(projekte, z, f);
      for (const [wert, n] of counts) {
        $$(`[data-count-for="${CSS.escape(`${f.key}|${wert}`)}"]`).forEach((el) => {
          el.textContent = String(n);
          el.closest('.facet__option')?.classList.toggle('is-empty', n === 0);
        });
      }
    }

    // Eingaben synchron halten
    suche.value = z.q;
    sortSelect.value = z.sort;
    $$<HTMLInputElement>('input[data-facet]').forEach((el) => {
      el.checked = z[el.dataset.facet as ListenFacette].includes(el.value);
    });
    $$<HTMLInputElement>('[data-kosten-von]').forEach((el) => (el.value = String(z.kosten[0])));
    $$<HTMLInputElement>('[data-kosten-bis]').forEach((el) => (el.value = String(z.kosten[1])));
    const kostenText = kostenAktiv(z)
      ? z.kosten[0] === z.kosten[1]
        ? GESAMTKOSTEN[z.kosten[0]]
        : `${GESAMTKOSTEN[z.kosten[0]]} bis ${GESAMTKOSTEN[z.kosten[1]].replace(/^bis /, '')}`
      : 'Alle Kostenklassen';
    $$('[data-kosten-text]').forEach((el) => (el.textContent = kostenText));
    $$('.kosten__slider').forEach((el) => {
      el.style.setProperty('--von', `${(z.kosten[0] / KOSTEN_MAX) * 100}%`);
      el.style.setProperty('--bis', `${(z.kosten[1] / KOSTEN_MAX) * 100}%`);
    });

    // Pills
    let gesamt = 0;
    for (const key of ['kategorie', 'nutzungsart', 'projektzweck', 'leerstandsdauer', 'kosten', 'foerderung'] as const) {
      const n = anzahlAktiv(z, key);
      gesamt += n;
      const pill = $(`[data-pill="${key}"]`);
      pill?.classList.toggle('is-aktiv', n > 0);
      const c = $(`[data-pill-count="${key}"]`);
      if (c) c.textContent = n ? String(n) : '';
    }
    $('[data-pill-count="alle"]')!.textContent = gesamt ? String(gesamt) : '';

    renderChips();

    // Ansicht
    const modus = effektiveAnsicht();
    ergebnisse.dataset.modus = modus;
    $$<HTMLButtonElement>('[data-ansicht]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ansicht === modus)));

    // Karte
    if (karte) {
      aktualisiereMarker(new Set(projekte.filter((p) => passt(p, z)).map((p) => p.slug)));
    }
    if (map) setTimeout(() => map!.invalidateSize(), 0);
    else karteLaden();

    if (url) {
      const qs = zustandZuParams(z).toString();
      history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
    }
  }

  function renderChips() {
    const chips = $('[data-chips]')!;
    chips.replaceChildren();
    const add = (label: string, entfernen: () => void, farbe?: string) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `${farbe ? `<span class="chip__dot" style="--dot:${farbe}" aria-hidden="true"></span>` : ''}${escapeHtml(label)} <span aria-hidden="true">×</span>`;
      btn.setAttribute('aria-label', `Filter entfernen: ${label}`);
      btn.addEventListener('click', () => {
        entfernen();
        sichtbar = SEITE;
        render();
        (chips.querySelector('button') ?? suche).focus();
      });
      li.append(btn);
      chips.append(li);
    };
    if (z.q) add(`„${z.q}“`, () => (z.q = ''));
    for (const f of FACETTEN) {
      for (const wert of z[f.key]) {
        const farbe = f.key === 'nutzungsart' ? `var(--use-${wert.toLowerCase()})` : undefined;
        add(chipLabel(f.key, wert), () => (z[f.key] = z[f.key].filter((w) => w !== wert)), farbe);
      }
    }
    if (kostenAktiv(z)) add($('[data-kosten-text]')!.textContent || 'Kosten', () => (z.kosten = [0, KOSTEN_MAX]));
    $('[data-aktiv]')!.hidden = chips.children.length === 0;
  }

  // ── Ereignisse ───────────────────────────────────────────────────────
  const aendern = () => {
    sichtbar = SEITE;
    render();
  };

  let suchTimer: number | undefined;
  suche.addEventListener('input', () => {
    clearTimeout(suchTimer);
    suchTimer = window.setTimeout(() => {
      z.q = suche.value.trim();
      aendern();
    }, 200);
  });
  $('[data-suche]')!.addEventListener('submit', (e) => {
    e.preventDefault();
    z.q = suche.value.trim();
    aendern();
  });
  sortSelect.addEventListener('change', () => {
    z.sort = sortSelect.value as Sortierung;
    aendern();
  });
  root.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.matches('input[data-facet]')) {
      const key = el.dataset.facet as ListenFacette;
      z[key] = el.checked ? [...new Set([...z[key], el.value])] : z[key].filter((w) => w !== el.value);
      aendern();
    }
  });
  root.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.matches('[data-kosten-von], [data-kosten-bis]')) {
      const fs = el.closest('[data-kosten]')!;
      let von = Number($<HTMLInputElement>('[data-kosten-von]', fs)!.value);
      let bis = Number($<HTMLInputElement>('[data-kosten-bis]', fs)!.value);
      if (von > bis) {
        if (el.matches('[data-kosten-von]')) bis = von;
        else von = bis;
      }
      z.kosten = [von, bis];
      aendern();
    }
  });
  root.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-reset]');
    if (!el) return;
    const key = el.dataset.reset!;
    if (key === 'alle') {
      const { sort, ansicht } = z;
      z = { ...leererZustand(), sort, ansicht };
      kartenBounds = undefined;
      boundsCheckbox.checked = false;
    } else if (key === 'kosten') z.kosten = [0, KOSTEN_MAX];
    else z[key as ListenFacette] = [];
    aendern();
  });
  $('[data-mehr]')!.addEventListener('click', () => {
    sichtbar += SEITE;
    render({ url: false, karte: false });
  });
  $$<HTMLButtonElement>('[data-ansicht]').forEach((b) =>
    b.addEventListener('click', () => {
      z.ansicht = b.dataset.ansicht as Ansicht;
      render();
    }),
  );
  mobil.addEventListener('change', () => render({ url: false }));
  boundsCheckbox.addEventListener('change', () => {
    kartenBounds = boundsCheckbox.checked && map ? map.getBounds() : undefined;
    render({ karte: false });
  });

  // Filter-Panels (Pills): je eins offen, Escape und Klick daneben schließen
  const pillBtns = $$<HTMLButtonElement>('[data-pill-btn]');
  const schliessePanels = (ausser?: HTMLButtonElement) => {
    for (const b of pillBtns) {
      if (b === ausser) continue;
      b.setAttribute('aria-expanded', 'false');
      $(`#${b.getAttribute('aria-controls')}`)!.hidden = true;
    }
  };
  for (const b of pillBtns) {
    b.addEventListener('click', () => {
      const offen = b.getAttribute('aria-expanded') === 'true';
      schliessePanels(b);
      b.setAttribute('aria-expanded', String(!offen));
      const panel = $(`#${b.getAttribute('aria-controls')}`)!;
      panel.hidden = offen;
      if (!offen) panel.querySelector<HTMLInputElement>('input')?.focus();
    });
  }
  $$('[data-panel-close]').forEach((b) =>
    b.addEventListener('click', () => {
      const panel = b.closest('[data-panel]')!;
      const btn = $<HTMLButtonElement>(`[aria-controls="${panel.id}"]`)!;
      schliessePanels();
      btn.focus();
    }),
  );
  document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('.pill')) schliessePanels();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const offen = pillBtns.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (offen) {
      schliessePanels();
      offen.focus();
    }
  });

  // „Alle Filter“ / Bottom-Sheet
  $('[data-alle-filter]')!.addEventListener('click', () => {
    schliessePanels();
    sheet.showModal();
  });
  $$('[data-sheet-close]').forEach((b) => b.addEventListener('click', () => sheet.close()));
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) sheet.close();
  });

  // Vergleichsleiste
  const leiste = $('[data-vergleichsleiste]')!;
  function renderVergleich(slugs: string[]) {
    leiste.hidden = slugs.length === 0;
    $('[data-vergleich-anzahl]')!.textContent = String(slugs.length);
    const link = $<HTMLAnchorElement>('[data-vergleich-link]')!;
    link.href = `${base}vergleich/?p=${slugs.join(',')}`;
    const slots = $('[data-vergleich-slots]')!;
    slots.replaceChildren(
      ...[0, 1, 2].map((i) => {
        const li = document.createElement('li');
        const p = bySlug.get(slugs[i]);
        if (p) {
          li.classList.add('is-filled');
          if (p.bild) li.style.backgroundImage = `url("${p.bild}")`;
        }
        return li;
      }),
    );
  }
  renderVergleich(getVergleich());
  onVergleichChange(renderVergleich);

  // Sprung aus Kopfzeile („Projekte durchsuchen“)
  if (location.hash === '#suche') suche.focus();

  render({ url: false });
}
