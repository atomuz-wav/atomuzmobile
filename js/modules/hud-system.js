import { mixColor, clamp01 } from '../utils/svg.js';

/* =========================================================================
   HUD ANIMADO
   -------------------------------------------------------------------------
   - Indicadores laterais: varredura de atividade e indicador atenuado "respirando".
   - Segmentos digitais (navbar e ornamento inferior): onda de luz sequencial.
   - Retículas: anel interno pulsando, centro piscando, anel tracejado girando.

   Só cores, opacidades e transformações mudam. Em t = 0, tudo volta às
   cores do CSS (quadro estático igual à referência).
   ========================================================================= */

const TECH = '#00CC22';
const LIT = '#7DFF7D';       // verde claro de "aceso"
/** Indicador atenuado: lido do CSS (--c-dim), que muda com o tema. */
const readDim = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--c-dim').trim() || '#8FDD9A';
let DIM = readDim();
document.addEventListener('atomuz:themechange', () => { DIM = readDim(); });

const SWEEP_PERIOD = 5;      // s — intervalo entre varreduras dos segmentos
const SWEEP_DURATION = 1.3;  // s — tempo de uma varredura
const CASCADE_PERIOD = 4.5;  // s — varredura dos indicadores laterais

/** Intensidade (0…1) da onda de luz no item `i` de `count`, no instante `time`. */
function sweep(time, i, count, period, duration, delay = 0) {
  const local = (time - delay) % period;
  if (local < 0 || local > duration) return 0;
  const head = (local / duration) * (count + 2) - 1;   // posição da onda (em itens)
  return Math.exp(-(((i - head) / 0.75) ** 2));
}

export function createHudSystem(root = document) {
  const indicators = [...root.querySelectorAll('[data-indicator]')];

  // Grupos de segmentos (navbar e ornamento) — data-segments-reverse inverte o sentido
  const segmentGroups = [...root.querySelectorAll('[data-segments]')].map((group, g) => {
    const items = [...group.children];
    if (group.hasAttribute('data-segments-reverse')) items.reverse();
    return { items, delay: 0.8 + g * 0.35 };
  });

  const reticles = [...root.querySelectorAll('[data-reticle]')].map((el, k) => ({
    cx: el.dataset.cx,
    cy: el.dataset.cy,
    ring: el.querySelector('[data-reticle-ring]'),
    core: el.querySelector('[data-reticle-core]'),
    spin: el.querySelector('[data-reticle-spin]'),
    phase: k * 1.3,
  }));

  function clear() {
    for (const el of indicators) el.style.fill = '';
    for (const g of segmentGroups) for (const el of g.items) el.style.fill = '';
    for (const r of reticles) {
      r.ring?.removeAttribute('transform');
      r.spin?.removeAttribute('transform');
      if (r.core) r.core.style.opacity = '';
    }
  }

  return {
    update(time) {
      if (time === 0) { clear(); return; }

      // Indicadores: varredura de cima para baixo; o atenuado "respira"
      indicators.forEach((el, i) => {
        const lit = sweep(time, i, indicators.length, CASCADE_PERIOD, 0.9, 1.2);
        if (el.hasAttribute('data-dim')) {
          const breath = 0.5 - 0.5 * Math.cos(time * 1.6);
          el.style.fill = mixColor(DIM, '#3EE05A', Math.max(breath * 0.6, lit));
        } else {
          el.style.fill = mixColor('#00E01C', LIT, lit);
        }
      });

      // Segmentos digitais: onda de luz sequencial
      for (const group of segmentGroups) {
        group.items.forEach((el, i) => {
          const lit = sweep(time, i, group.items.length, SWEEP_PERIOD, SWEEP_DURATION, group.delay);
          el.style.fill = mixColor(TECH, LIT, lit);
        });
      }

      // Retículas
      for (const r of reticles) {
        const beat = 0.5 - 0.5 * Math.cos(time * 1.9 + r.phase);     // 0…1
        r.ring?.setAttribute(
          'transform',
          `translate(${r.cx} ${r.cy}) scale(${(1 + 0.16 * beat).toFixed(3)}) translate(${-r.cx} ${-r.cy})`,
        );
        if (r.core) r.core.style.opacity = (0.55 + 0.45 * clamp01(1 - beat)).toFixed(3);
        r.spin?.setAttribute('transform', `rotate(${((time * 9) % 360).toFixed(2)} ${r.cx} ${r.cy})`);
      }
    },

    reset: clear,
  };
}
