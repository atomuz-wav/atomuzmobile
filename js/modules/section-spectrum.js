/* =========================================================================
   ESPECTRO DE FREQUÊNCIAS DOS CABEÇALHOS DE SEÇÃO
   -------------------------------------------------------------------------
   Desenha um equalizador de barras finas e arredondadas (alinhadas pela
   base, com leve brilho) em cada <canvas data-spectrum>. Não há áudio de
   verdade: os níveis são simulados para parecer rápidos e pulsantes —
   - cada barra sorteia uma nova altura a cada 40–110 ms;
   - um kick a 145 BPM faz todas as barras "pulsarem" juntas no tempo;
   - subida e descida rápidas, para o movimento ficar fluido e nervoso.

   Igual aos orbs: só anima com o canvas na tela e a aba visível; com
   movimento desligado (reduzido ou pausado) mostra um quadro fixo.

   Opções (usadas no espectro da navbar, que fica na tela o tempo todo):
   - fps: limita os quadros por segundo (30 já parece fluido aqui, porque
     cada barra só muda de alvo a cada 40–110 ms);
   - softGlow: brilho desenhado como uma pílula mais larga e transparente
     atrás de cada barra, em vez de shadowBlur — no Safari do iPhone a sombra
     do canvas é calculada pelo processador e pesa a cada quadro.
   ========================================================================= */
const BARS = 22;
const BPM = 145;
const ATTACK = 38;             // velocidade de subida (por segundo)
const RELEASE = 16;            // velocidade de descida (por segundo)
// Quadro fixo: alturas variadas, como na referência
const STILL = [0.95, 0.8, 0.6, 0.12, 0.5, 0.35, 0.25, 0.7, 0.12, 0.3, 0.95,
  0.15, 0.62, 0.15, 0.3, 0.12, 0.75, 0.6, 0.72, 0.95, 0.58, 0.32];

/* Cores por tema: "base" nas barras baixas, "peak" nas mais altas;
   "glow" é o brilho em volta (só no escuro, no claro ficaria borrado). */
const PALETTE = {
  dark: { base: [40, 170, 40], peak: [110, 255, 90], glow: 'rgba(0, 255, 0, 0.55)' },
  light: { base: [0, 120, 22], peak: [0, 170, 30], glow: null },
};

const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';
const mix = (a, b, f) => a.map((v, i) => Math.round(v + (b[i] - v) * f));

/** Barra com as pontas arredondadas (pílula vertical). */
function pill(ctx, x, y, w, h) {
  const r = w / 2;
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + r, y + h - r, r, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
}

function createSpectrum(canvas, { fps = 0, softGlow = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const levels = STILL.slice();
  const goals = STILL.slice();
  const nextPick = new Array(BARS).fill(0);   // quando cada barra sorteia um novo alvo
  let palette = isDarkTheme() ? PALETTE.dark : PALETTE.light;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  const minStep = fps ? 1000 / fps - 2 : 0;   // ms entre quadros (folga de 2 ms)
  let visible = false;
  let enabled = false;

  function fit() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round((canvas.clientWidth || 128) * dpr);
    canvas.height = Math.round((canvas.clientHeight || 28) * dpr);
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const pad = palette.glow ? Math.round(3 * dpr) : 0;   // espaço para o brilho não ser cortado
    const step = (w - pad * 2) / BARS;
    const barW = Math.max(2, step * 0.5);
    const maxH = h - pad * 2;

    if (softGlow && palette.glow) {
      // brilho barato: halo arredondado atrás de cada barra, sem desfoque
      ctx.shadowBlur = 0;
      ctx.fillStyle = palette.glow;
      ctx.globalAlpha = 0.35;
      const haloW = Math.min(step, barW + 2 * pad);
      for (let i = 0; i < BARS; i++) {
        const level = Math.min(1, Math.max(0, levels[i]));
        const barH = Math.max(barW * 1.4, level * maxH);
        pill(ctx, pad + i * step + (step - haloW) / 2, h - pad - barH - (haloW - barW) / 2, haloW, barH + (haloW - barW));
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.shadowColor = palette.glow || 'transparent';
      ctx.shadowBlur = palette.glow ? 4 * dpr : 0;
    }
    for (let i = 0; i < BARS; i++) {
      const level = Math.min(1, Math.max(0, levels[i]));
      const barH = Math.max(barW * 1.4, level * maxH);     // a menor barra ainda é uma pílula
      const c = mix(palette.base, palette.peak, level);
      ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
      pill(ctx, pad + i * step + (step - barW) / 2, h - pad - barH, barW, barH);
    }
  }

  function tick(now) {
    if (minStep && now - last < minStep) {   // limite de fps: pula este quadro
      raf = requestAnimationFrame(tick);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    const beat = (now / 1000) * BPM / 60;
    const kick = Math.exp(-(beat % 1) * 7);   // 1 no início do tempo, cai rápido

    for (let i = 0; i < BARS; i++) {
      if (now >= nextPick[i]) {
        // Alturas sorteadas: muitas barras altas, algumas bem baixas
        goals[i] = 0.06 + 0.94 * Math.random() ** 0.7;
        nextPick[i] = now + 40 + Math.random() * 70;
      }
      // No kick todas sobem juntas; entre um tempo e outro, recuam um pouco
      const goal = Math.min(1, goals[i] * (0.72 + 0.28 * kick) + 0.2 * kick);
      const rate = goal > levels[i] ? ATTACK : RELEASE;
      levels[i] += (goal - levels[i]) * Math.min(1, rate * dt);
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (enabled && visible && document.visibilityState !== 'hidden') {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!enabled) {
      STILL.forEach((v, i) => { levels[i] = v; });
      draw();
    }
  }

  fit();
  draw();

  return {
    canvas,
    setVisible(value) { visible = value; sync(); },
    setEnabled(value) { enabled = value; sync(); },
    refreshTheme() { palette = isDarkTheme() ? PALETTE.dark : PALETTE.light; draw(); },
    resize() { fit(); draw(); },
    sync,
  };
}

export function createSectionSpectrum(root = document, options = {}) {
  const items = [...root.querySelectorAll('canvas[data-spectrum]')]
    .map((canvas) => createSpectrum(canvas, options)).filter(Boolean);
  if (!items.length) return { enable() {}, disable() {} };

  const byCanvas = new Map(items.map((item) => [item.canvas, item]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => byCanvas.get(entry.target)?.setVisible(entry.isIntersecting));
    });
    items.forEach((item) => io.observe(item.canvas));
  } else {
    items.forEach((item) => item.setVisible(true));
  }

  // O tamanho muda entre desktop e celular (CSS)
  let resizeId;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(() => items.forEach((item) => item.resize()), 150);
  });

  document.addEventListener('visibilitychange', () => items.forEach((item) => item.sync()));
  document.addEventListener('atomuz:themechange', () => items.forEach((item) => item.refreshTheme()));

  return {
    enable() { items.forEach((item) => item.setEnabled(true)); },
    disable() { items.forEach((item) => item.setEnabled(false)); },
  };
}
