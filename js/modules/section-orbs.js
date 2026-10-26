/* =========================================================================
   ORBS DOS CABEÇALHOS DE SEÇÃO
   -------------------------------------------------------------------------
   Desenha os "thinking orbs" (biblioteca thinking-orbs, MIT) em qualquer
   <canvas data-orb="estado">. Estados disponíveis: working, searching,
   solving, listening, connecting, weaving, composing, breathing, shaping.

   O pacote original é um componente React; aqui usamos só o motor de
   geometria dele (js/vendor/thinking-orbs.js) com um laço próprio:
   - tinta verde neon no tema escuro e verde profundo no claro;
   - só anima enquanto o orb está na tela e a aba está visível;
   - com movimento desligado (reduzido ou pausado), mostra um quadro fixo.
   ========================================================================= */
// O arquivo do pacote exporta com nomes curtos (gerados pelo empacotador)
import {
  r as resolvePreset,
  M as MODE_FRAMES,
  p as paintFrame,
} from '../vendor/thinking-orbs.js';

const SIZES = [64, 32, 20];                 // tamanhos afinados pelo autor
const STILL_FRAME = 0.6;                    // mesmo quadro fixo do pacote original
const TINT = {
  dark: { r: 0x00, g: 0xff, b: 0x00 },      // #00FF00 · verde neon
  light: { r: 0x00, g: 0x8c, b: 0x18 },     // #008C18 · verde profundo
};

const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';

function createOrb(canvas) {
  const state = canvas.dataset.orb || 'working';
  const size = SIZES.includes(Number(canvas.dataset.orbSize)) ? Number(canvas.dataset.orbSize) : 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const { mode, speed, opts } = resolvePreset(state, size);
  const frameFn = MODE_FRAMES[mode];
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  // O desenho é feito no tamanho do preset (ex.: 64) e encolhido para o
  // tamanho que o CSS dá ao canvas, mantendo a nitidez em telas retina.
  let scale = dpr;
  function fit() {
    const shown = canvas.clientWidth || size;
    canvas.width = Math.round(shown * dpr);
    canvas.height = Math.round(shown * dpr);
    scale = (shown / size) * dpr;
  }
  fit();

  let dark = isDarkTheme();
  let raf = 0;
  let visible = false;
  let enabled = false;

  function draw(tSec) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, size, size);
    // "dark" no motor = tinta clara para fundo escuro
    paintFrame(ctx, frameFn(size, tSec, opts), dark, dark ? TINT.dark : TINT.light);
  }

  const tick = () => {
    draw((performance.now() / 1000) * speed);
    raf = requestAnimationFrame(tick);
  };

  function sync() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (enabled && visible && document.visibilityState !== 'hidden') tick();
    else if (!enabled) draw(STILL_FRAME);
  }

  return {
    canvas,
    setVisible(value) { visible = value; sync(); },
    setEnabled(value) { enabled = value; sync(); },
    refreshTheme() { dark = isDarkTheme(); if (!raf) draw(enabled ? (performance.now() / 1000) * speed : STILL_FRAME); },
    sync,
    resize() { fit(); if (!raf) draw(enabled ? (performance.now() / 1000) * speed : STILL_FRAME); },
  };
}

export function createSectionOrbs(root = document) {
  const orbs = [...root.querySelectorAll('canvas[data-orb]')].map(createOrb).filter(Boolean);
  if (!orbs.length) return { enable() {}, disable() {} };

  const byCanvas = new Map(orbs.map((orb) => [orb.canvas, orb]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => byCanvas.get(entry.target)?.setVisible(entry.isIntersecting));
    });
    orbs.forEach((orb) => io.observe(orb.canvas));
  } else {
    orbs.forEach((orb) => orb.setVisible(true));
  }

  // O tamanho do orb muda entre desktop e celular (CSS)
  let resizeId;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(() => orbs.forEach((orb) => orb.resize()), 150);
  });

  document.addEventListener('visibilitychange', () => orbs.forEach((orb) => orb.sync()));
  document.addEventListener('atomuz:themechange', () => orbs.forEach((orb) => orb.refreshTheme()));

  return {
    enable() { orbs.forEach((orb) => orb.setEnabled(true)); },
    disable() { orbs.forEach((orb) => orb.setEnabled(false)); },
  };
}
