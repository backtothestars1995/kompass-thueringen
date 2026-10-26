/**
 * Gemeinsame Leaflet-Grundlagen: OpenStreetMap-Kacheln mit sichtbarer
 * Attribution und farbige Marker je Nutzungsart (Farben aus tokens.css).
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

// Plugins wie leaflet.markercluster erwarten Leaflet als globale Variable
(window as unknown as { L: typeof L }).L = L;

export const THUERINGEN_BOUNDS = L.latLngBounds([50.2, 9.87], [51.65, 12.65]);

export function createMap(el: HTMLElement, options: L.MapOptions = {}): L.Map {
  const map = L.map(el, {
    scrollWheelZoom: false,
    ...options,
  });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
  }).addTo(map);
  map.attributionControl.setPrefix(false);
  return map;
}

/** CSS-Farbe einer Nutzungsart, gelesen aus den Design-Tokens */
export function nutzungsFarbe(nutzungsart: string | undefined): string {
  const key = (nutzungsart ?? '').toLowerCase();
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--use-${key}`).trim();
  return value || getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
}

export function markerIcon(farbe: string, aktiv = false): L.DivIcon {
  const size = aktiv ? 30 : 22;
  return L.divIcon({
    className: 'kompass-marker',
    html: `<span style="--marker:${farbe}" class="kompass-marker__dot${aktiv ? ' is-active' : ''}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export { L };
