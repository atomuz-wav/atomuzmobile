import { svgEl, clamp01 } from '../utils/svg.js';
import { intro } from '../core/state.js';

/* =========================================================================
   ENERGIA DO LOGOTIPO
   -------------------------------------------------------------------------
   1. Pulsos de energia percorrem o contorno das letras.
   2. O brilho (halo) oscila de forma muito discreta — e reage ao cursor.
   3. Pontos luminosos surgem nas junções/vértices das letras.
   4. Na entrada, uma faixa de luz atravessa o logotipo (intro.sweep).

   Tudo isso fica oculto no quadro estático (t = 0 e movimento reduzido).
   ========================================================================= */

/** Junções e vértices das letras (coordenadas da referência). */
const SPARK_POINTS = [
  [308, 937],   // topo do A
  [308, 1047],  // ponto do A
  [425, 955],   // ponta esquerda da barra do T
  [668, 955],   // ponta direita da barra do T
  [700, 1010],  // lateral do O
  [955, 1010],  // lateral do O
  [1000, 945],  // topo esquerdo do M
  [1255, 945],  // topo direito do M
  [1126, 1066], // ponto do M
  [1430, 1010], // ponto do U
  [1600, 955],  // canto do Z
  [1845, 955],  // canto do Z
  [1600, 1070], // base do Z
  [1845, 1070], // base do Z
];

const SPARK_COUNT = 3;
const SPARK_LIFE = 1.4;     // s — duração de cada faísca
const SPARK_GAP = 2.6;      // s — intervalo entre faíscas da mesma "vaga"
const PULSE_LENGTH = 70;    // comprimento do pulso (unidades da referência)

/** Pseudoaleatório determinístico a partir de um número (sem estado). */
const hash = (n) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

export function createLogoEnergy(svg, interaction) {
  const layer = svg.querySelector('[data-logo-energy]');
  // O contorno do logo fica no sprite SVG compartilhado (fora do palco)
  const source = document.getElementById('wm-path');
  if (!layer || !source) return { update() {}, reset() {} };

  /* ---------- 1. Pulsos no contorno ----------
     O path do logo tem vários contornos (letras, o miolo do O e os
     pontinhos). Cada contorno de letra vira um <path> próprio com um traço
     curto (dash) que circula por ele; os pontinhos (contornos curtos) ficam
     de fora — um pulso neles pareceria só uma piscada. */
  const MIN_CONTOUR = 300;
  const contours = source.getAttribute('d').split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
  const pulses = contours.map((d, i) => {
    const core = svgEl('path', { d, class: 'logo-pulse' });
    layer.append(core);
    const length = core.getTotalLength();
    if (length < MIN_CONTOUR) { core.remove(); return null; }
    const halo = svgEl('path', { d, class: 'logo-pulse logo-pulse--halo' });
    layer.insertBefore(halo, core);
    const dash = `${PULSE_LENGTH} ${Math.max(length - PULSE_LENGTH, 1)}`;
    halo.setAttribute('stroke-dasharray', dash);
    core.setAttribute('stroke-dasharray', dash);
    return {
      halo,
      core,
      length,
      speed: 150 + hash(i + 1) * 120,      // unidades/s
      rhythm: 0.35 + hash(i + 11) * 0.3,   // frequência de aparição
      phase: hash(i + 21) * Math.PI * 2,
    };
  }).filter(Boolean);

  /* ---------- 2. Halo ----------
     A oscilação muda a opacidade da CAMADA inteira do halo (CSS), que a GPU
     aplica sem recalcular o desfoque. */
  const haloLayer = svg.querySelector('.layer-logo-halo');
  const haloBase = haloLayer ? parseFloat(getComputedStyle(haloLayer).opacity) || 1 : 1;

  /* ---------- 3. Faíscas ---------- */
  const sparks = Array.from({ length: SPARK_COUNT }, () => {
    const el = svgEl('g', { class: 'logo-spark' }, [
      svgEl('circle', { class: 'logo-spark__halo', r: 16 }),
      svgEl('path', { class: 'logo-spark__flare', d: 'M0 -13 L1.8 -1.8 L13 0 L1.8 1.8 L0 13 L-1.8 1.8 L-13 0 L-1.8 -1.8 Z' }),
    ]);
    layer.append(el);
    return el;
  });

  /* ---------- 4. Faixa de luz da entrada (recortada pelas letras) ---------- */
  const sweep = svgEl('rect', { class: 'logo-sweep', x: -150, y: 880, width: 300, height: 260, fill: 'url(#g-sweep)' });
  layer.append(svgEl('g', { 'clip-path': 'url(#wm-clip)' }, [sweep]));

  function updateSweep() {
    const s = intro.sweep;
    const active = s > 0 && s < 1;
    sweep.style.opacity = active ? Math.sin(s * Math.PI).toFixed(3) : 0;
    if (active) sweep.setAttribute('transform', `translate(${(100 + s * 1900).toFixed(1)} 0) skewX(-18)`);
  }

  function hideAll() {
    for (const p of pulses) {
      p.halo.style.opacity = 0;
      p.core.style.opacity = 0;
    }
    for (const s of sparks) s.style.opacity = 0;
    if (haloLayer) haloLayer.style.opacity = '';
    sweep.style.opacity = 0;
  }

  return {
    update(time) {
      if (time === 0) { hideAll(); return; }

      // Pulsos: aparecem e somem em ondas, cada contorno no seu ritmo
      for (const p of pulses) {
        const wave = Math.sin(time * p.rhythm + p.phase);
        const visible = clamp01((wave - 0.55) / 0.45) ** 1.5;
        const offset = -((time * p.speed + p.phase * 100) % p.length);
        p.core.style.opacity = visible.toFixed(3);
        p.halo.style.opacity = (visible * 0.5).toFixed(3);
        p.core.setAttribute('stroke-dashoffset', offset.toFixed(1));
        p.halo.setAttribute('stroke-dashoffset', offset.toFixed(1));
      }

      // Halo: ±7 % de intensidade, ciclo de ~7 s; +25 % com o cursor sobre o logo
      const hover = interaction?.logoHover ?? 0;
      const breath = (1 + 0.07 * Math.sin(time * 0.9)) * (1 + 0.25 * hover);
      if (haloLayer) haloLayer.style.opacity = Math.min(1, haloBase * breath).toFixed(3);

      updateSweep();

      // Faíscas: cada uma nasce num vértice diferente, cresce e some
      sparks.forEach((el, k) => {
        const local = time + (k * SPARK_GAP) / SPARK_COUNT;
        const cycle = Math.floor(local / SPARK_GAP);
        const life = (local % SPARK_GAP) / SPARK_LIFE;
        if (life > 1) { el.style.opacity = 0; return; }
        const [x, y] = SPARK_POINTS[Math.floor(hash(cycle * 7 + k * 31) * SPARK_POINTS.length)];
        const intensity = Math.sin(life * Math.PI);
        el.style.opacity = intensity.toFixed(3);
        el.setAttribute('transform', `translate(${x} ${y}) scale(${(0.4 + 0.6 * intensity).toFixed(3)})`);
      });
    },

    reset: hideAll,
  };
}
