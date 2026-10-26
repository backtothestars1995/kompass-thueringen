/**
 * Merken- und Vergleichen-Schalter auf Projektkarten und im Steckbrief.
 * Funktioniert für alle Elemente mit [data-merken] bzw. [data-vergleich],
 * auch für nachträglich eingefügte (Ereignis-Delegation).
 */
import { getMerkliste, onMerklisteChange, toggleMerken } from '../lib/merkliste';
import { getVergleich, MAX_VERGLEICH, onVergleichChange, toggleVergleich } from '../lib/vergleich';

function syncMerken(slugs = getMerkliste()) {
  document.querySelectorAll<HTMLElement>('[data-merken]').forEach((el) => {
    const on = slugs.includes(el.dataset.merken!);
    el.setAttribute('aria-pressed', String(on));
    const label = el.querySelector('[data-merken-label]');
    if (label) label.textContent = on ? 'Gemerkt' : 'Merken';
  });
}

function syncVergleich(slugs = getVergleich()) {
  const voll = slugs.length >= MAX_VERGLEICH;
  document.querySelectorAll<HTMLInputElement>('input[data-vergleich]').forEach((el) => {
    el.checked = slugs.includes(el.dataset.vergleich!);
    el.disabled = voll && !el.checked;
    el.closest('label')?.setAttribute('title', el.disabled ? `Höchstens ${MAX_VERGLEICH} Projekte vergleichbar` : '');
  });
  document.querySelectorAll<HTMLElement>('button[data-vergleich]').forEach((el) => {
    const on = slugs.includes(el.dataset.vergleich!);
    el.setAttribute('aria-pressed', String(on));
  });
}

let initialised = false;
export function initProjektAktionen() {
  syncMerken();
  syncVergleich();
  if (initialised) return;
  initialised = true;
  onMerklisteChange(syncMerken);
  onVergleichChange(syncVergleich);
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('button[data-merken]');
    if (btn) {
      e.preventDefault();
      toggleMerken(btn.dataset.merken!);
      return;
    }
    const vbtn = (e.target as Element).closest<HTMLElement>('button[data-vergleich]');
    if (vbtn) {
      e.preventDefault();
      if (!toggleVergleich(vbtn.dataset.vergleich!)) {
        alert(`Sie können höchstens ${MAX_VERGLEICH} Projekte gleichzeitig vergleichen.`);
      }
    }
  });
  document.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.matches('input[data-vergleich]')) toggleVergleich(input.dataset.vergleich!);
  });
}
