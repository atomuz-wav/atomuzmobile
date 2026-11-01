/* =========================================================================
   CAMPO DE CÓDIGO (fundo interativo das seções 01–04, 07 e 08; só no
   desktop — no celular e em aparelhos fracos fica só a onda da Hero)
   -------------------------------------------------------------------------
   Uma grade de caracteres (0, 1 e as letras de ATOMUZ) cobre o fundo da
   seção, quase invisível em repouso, com a palavra ATOMUZ escondida em
   algumas linhas.
   - Repouso: caracteres trocam sozinhos aqui e ali, com um leve brilho,
     enquanto a seção está na tela (0 e 1 aparecem mais que as letras).
   - Cursor: acende os caracteres num raio ao redor dele e os embaralha;
     ao se afastar, o brilho se apaga devagar (deixa um rastro).
   - Clique/toque: uma onda circular atravessa a seção acendendo a grade.

   Desempenho:
   - Desenho incremental: depois do quadro inicial, só as células acesas
     (ou que acabaram de apagar) são redesenhadas.
   - O canvas só existe enquanto a seção está perto da tela (memória) e o
     loop só roda enquanto ela está perto da tela (fora dela, custa zero).
   - Movimento reduzido/pausado: fica só a grade estática, sem interação.

   Modo "só onda" (Hero): nada aparece em repouso nem sob o cursor; só o
   clique revela a grade, dentro da onda, que some logo depois.

   Leitura: atrás dos textos da seção a grade fica rarefeita e mais fraca
   (só ~1 em cada 7 células aparece), para não competir com o conteúdo.
   ========================================================================= */
const BITS = '01';
const LETTERS = 'AaTtOoMmUuZz';
const BIT_SHARE = 0.72;       // proporção de 0 e 1 em relação às letras
const WORDS = ['ATOMUZ', 'atomuz', 'ATOM', '0101'];
const FONT = '"Share Tech Mono", ui-monospace, monospace';

const HOVER_RADIUS = 150;     // px — raio do "holofote" do cursor
const COOL_RATE = 2.4;        // velocidade com que o brilho se apaga (1/s)
const SCRAMBLE_RATE = 6;      // trocas de caractere por segundo (célula 100 % acesa)
const RING_SPEED = 760;       // px/s — velocidade da onda do clique
const RING_BAND = 56;         // px — espessura da onda
const EDGE_FADE = 96;         // px — esmaecimento no topo e na base da seção
const MAX_DPR = 1.5;
const TEXT_PAD_X = 16;        // px — margem da área "silenciosa" ao redor dos textos
const TEXT_PAD_Y = 8;
const TEXT_KEEP = 0.15;       // fração das células que continua atrás dos textos
const TEXT_DIM = 0.35;        // opacidade relativa dessas células
const IDLE_FLIP_RATE = 0.03;  // fração das células que troca por segundo em repouso

const pick = (set) => set[(Math.random() * set.length) | 0];
const randChar = () => (Math.random() < BIT_SHARE ? pick(BITS) : pick(LETTERS));
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Paleta por tema: base (repouso) e as duas cores do brilho. */
function palette() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return dark
    ? { base: '#00CC22', baseAlpha: 0.1, low: '#00CC22', high: '#00FF00', hotAlpha: 0.7, glint: 0.16 }
    // no branco, o verde claro quase some: tudo em verde profundo, com
    // repouso e brilho das trocas mais fortes para o movimento aparecer
    : { base: '#008C18', baseAlpha: 0.12, low: '#008C18', high: '#008C18', hotAlpha: 0.6, glint: 0.55 };
}

function createField(section, { rippleOnly = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'code-field';
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);

  let ctx = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let cellW = 13;
  let cellH = 20;
  let fontSize = 14;
  let cols = 0;
  let rows = 0;
  let chars = [];             // caractere atual de cada célula
  let present = null;         // 1 = célula visível em repouso
  let word = null;            // 1 = faz parte de uma palavra (não embaralha)
  let fade = null;            // esmaecimento nas bordas (0–1)
  let base = null;            // opacidade em repouso
  let heat = null;            // brilho atual (0–1)
  let lit = null;             // 1 = foi desenhada acesa no último quadro
  let quiet = null;           // 1 = célula atrás de um texto
  let keep = null;            // 1 = sobrevive na área de texto (sorteio fixo)
  let colors = palette();

  let near = false;           // seção perto da tela (canvas alocado)
  let visible = false;        // seção de fato na tela (o loop só anima assim)
  let interactive = false;
  let frame = 0;
  let last = 0;
  let pointer = null;         // { x, y } em coordenadas da seção
  const rings = [];

  /* ---------- grade ---------- */
  function build() {
    const rect = section.getBoundingClientRect();
    width = Math.round(rect.width);
    height = Math.round(section.offsetHeight);
    if (!width || !height) return;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx = canvas.getContext('2d');

    const compact = width < 700;
    fontSize = compact ? 12 : 14;
    cellW = compact ? 11 : 13;
    cellH = compact ? 18 : 20;
    cols = Math.ceil(width / cellW);
    rows = Math.ceil(height / cellH);
    const n = cols * rows;

    chars = new Array(n);
    present = new Uint8Array(n);
    word = new Uint8Array(n);
    fade = new Float32Array(n);
    base = new Float32Array(n);
    heat = new Float32Array(n);
    lit = new Uint8Array(n);
    quiet = new Uint8Array(n);
    keep = new Uint8Array(n);

    // fase aleatória por seção: cada uma tem uma "nuvem" de código diferente
    const ox = Math.random() * 100;
    const oy = Math.random() * 100;
    for (let r = 0; r < rows; r++) {
      const y = r * cellH + cellH / 2;
      const edgeY = smooth(Math.min(y, height - y) / EDGE_FADE);
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const x = c * cellW + cellW / 2;
        // laterais mais vazias, como uma nuvem concentrada no centro
        const edgeX = smooth(Math.min(x, width - x) / (width * 0.18));
        fade[i] = edgeY * (0.35 + 0.65 * edgeX);
        // densidade por ruído suave (soma de senos) = manchas de código
        const d = 0.5 + 0.25 * Math.sin(c * 0.11 + ox + Math.sin(r * 0.17 + oy))
                      + 0.25 * Math.cos(r * 0.09 - c * 0.04 + oy);
        present[i] = d > 0.42 && Math.random() < 0.55 + d * 0.4 ? 1 : 0;
        base[i] = (0.35 + 0.65 * d) * fade[i];
        chars[i] = randChar();
        keep[i] = Math.random() < TEXT_KEEP ? 1 : 0;
      }
      // palavras escondidas em algumas linhas (como "npm i agents" na referência)
      if (Math.random() < 0.28) {
        const w = WORDS[(Math.random() * WORDS.length) | 0];
        const start = (Math.random() * Math.max(cols - w.length, 1)) | 0;
        for (let k = 0; k < w.length && start + k < cols; k++) {
          const i = r * cols + start + k;
          chars[i] = w[k];
          word[i] = 1;
          present[i] = 1;
        }
      }
    }
    markText();
    drawAll();
  }

  /** Marca as células que ficam atrás dos textos da seção (linha a linha). */
  function markText() {
    if (!quiet) return;
    quiet.fill(0);
    const origin = section.getBoundingClientRect();
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        const left = rect.left - origin.left - TEXT_PAD_X;
        const right = rect.right - origin.left + TEXT_PAD_X;
        const top = rect.top - origin.top - TEXT_PAD_Y;
        const bottom = rect.bottom - origin.top + TEXT_PAD_Y;
        const c0 = Math.max(0, Math.floor(left / cellW));
        const c1 = Math.min(cols - 1, Math.floor(right / cellW));
        const r0 = Math.max(0, Math.floor(top / cellH));
        const r1 = Math.min(rows - 1, Math.floor(bottom / cellH));
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) quiet[r * cols + c] = 1;
        }
      }
    }
  }

  function release() {
    canvas.width = 0;
    canvas.height = 0;
    ctx = null;
    cols = rows = 0;
    stop();
  }

  /* ---------- desenho ---------- */
  function setupContext() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${fontSize}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  }

  function drawCell(i) {
    const c = i % cols;
    const r = (i / cols) | 0;
    const x = c * cellW;
    const y = r * cellH;
    ctx.clearRect(x, y, cellW, cellH);
    // atrás de texto: só as células sorteadas aparecem, e mais fracas
    if (quiet[i] && !keep[i]) return;
    const dim = quiet[i] ? TEXT_DIM : 1;
    const h = heat[i];
    let alpha;
    if (h > 0.02) {
      // aceso: até a opacidade máxima, mais forte nas palavras escondidas
      alpha = Math.min(1, colors.baseAlpha * base[i] + h * colors.hotAlpha * (word[i] ? 1 : 0.8)) * (0.25 + 0.75 * fade[i]);
      ctx.fillStyle = h > 0.55 || word[i] ? colors.high : colors.low;
    } else {
      if (!present[i] || rippleOnly) return;
      alpha = colors.baseAlpha * base[i];
      ctx.fillStyle = colors.base;
    }
    alpha *= dim;
    if (alpha < 0.01) return;
    ctx.globalAlpha = alpha;
    ctx.fillText(chars[i], x + cellW / 2, y + cellH / 2);
  }

  function drawAll() {
    if (!ctx) return;
    colors = palette();
    setupContext();
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < cols * rows; i++) {
      lit[i] = heat[i] > 0.02 ? 1 : 0;
      drawCell(i);
    }
  }

  /* ---------- energia ---------- */
  /** Aquece as células dentro de um raio (só percorre a caixa do círculo). */
  function heatAround(px, py, radius, strength) {
    const c0 = Math.max(0, Math.floor((px - radius) / cellW));
    const c1 = Math.min(cols - 1, Math.floor((px + radius) / cellW));
    const r0 = Math.max(0, Math.floor((py - radius) / cellH));
    const r1 = Math.min(rows - 1, Math.floor((py + radius) / cellH));
    for (let r = r0; r <= r1; r++) {
      const dy = r * cellH + cellH / 2 - py;
      for (let c = c0; c <= c1; c++) {
        const dx = c * cellW + cellW / 2 - px;
        const d = Math.hypot(dx, dy);
        if (d > radius) continue;
        const v = strength * (1 - d / radius) ** 1.6;
        const i = r * cols + c;
        if (v > heat[i]) heat[i] = v;
      }
    }
  }

  function heatRings(dt) {
    const maxR = Math.hypot(width, height);
    for (let k = rings.length - 1; k >= 0; k--) {
      const ring = rings[k];
      ring.r += RING_SPEED * dt;
      if (ring.r - RING_BAND > maxR) { rings.splice(k, 1); continue; }
      const strength = 0.9 * (1 - ring.r / maxR) ** 0.7;
      const inner = Math.max(0, ring.r - RING_BAND);
      const outer = ring.r + RING_BAND * 0.25;
      // percorre só as linhas que a onda cruza
      const r0 = Math.max(0, Math.floor((ring.y - outer) / cellH));
      const r1 = Math.min(rows - 1, Math.floor((ring.y + outer) / cellH));
      for (let r = r0; r <= r1; r++) {
        const dy = r * cellH + cellH / 2 - ring.y;
        for (let c = 0; c < cols; c++) {
          const dx = c * cellW + cellW / 2 - ring.x;
          const d = Math.hypot(dx, dy);
          if (d < inner || d > outer) continue;
          // borda dianteira da onda mais intensa
          const t = (d - inner) / (outer - inner);
          const v = strength * Math.sin(t * Math.PI) ** 0.8;
          const i = r * cols + c;
          if (v > heat[i]) heat[i] = v;
        }
      }
    }
  }

  function step(now) {
    frame = 0;
    if (!ctx) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;

    if (pointer) heatAround(pointer.x, pointer.y, HOVER_RADIUS, 1);
    if (rings.length) heatRings(dt);

    // Repouso: trocas aleatórias espalhadas pela grade, cada uma com um
    // brilho breve (o mesmo resfriamento do cursor apaga o brilho)
    const n = cols * rows;
    let flips = rippleOnly ? 0 : n * IDLE_FLIP_RATE * dt;
    flips = Math.floor(flips) + (Math.random() < flips % 1 ? 1 : 0);
    for (let k = 0; k < flips; k++) {
      const i = (Math.random() * n) | 0;
      if (!present[i] || word[i] || quiet[i]) continue;
      chars[i] = randChar();
      // brilho breve de cada troca (mais forte no tema claro)
      if (heat[i] < colors.glint) heat[i] = colors.glint;
    }

    // Sem setupContext() aqui: a fonte, o alinhamento e a escala do canvas já
    // foram definidos no drawAll() e continuam valendo entre os quadros (só se
    // perdem quando o canvas muda de tamanho, e aí o build() redesenha tudo).
    // Definir ctx.font a cada quadro obrigava o navegador a recalcular o estilo
    // da página inteira: era o que deixava a onda da Hero pesada.
    // na Hero o rastro apaga mais rápido: lê-se como um anel, sem cobrir o logo
    const cool = Math.exp(-(rippleOnly ? COOL_RATE * 2.2 : COOL_RATE) * dt);
    let glowing = false;
    for (let i = 0; i < n; i++) {
      const h = heat[i];
      if (h <= 0.02 && !lit[i]) continue;
      glowing = true;
      if (h > 0.02) {
        // embaralha: sequências aleatórias que mudam enquanto acesas
        if (!word[i] && Math.random() < h * SCRAMBLE_RATE * dt) chars[i] = randChar();
        heat[i] = h * cool;
      } else {
        heat[i] = 0;
      }
      drawCell(i);
      lit[i] = heat[i] > 0.02 ? 1 : 0;
    }

    // O loop segue enquanto a seção está na tela (setVisible/stop param);
    // no modo "só onda", para assim que a onda e o brilho terminam
    if (rippleOnly && !rings.length && !glowing) { last = 0; return; }
    if (!visible && !rippleOnly) { last = 0; return; }
    frame = requestAnimationFrame(step);
  }

  function start() {
    // Perto da tela o canvas já fica pronto (sem "pipocar" ao rolar), mas só
    // anima quando a seção aparece: antes, a grade da seção logo abaixo da
    // Hero animava fora da vista (~2 ms por quadro no desktop)
    if (!frame && ctx && interactive && (visible || rippleOnly)) frame = requestAnimationFrame(step);
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }

  /* ---------- eventos ---------- */
  function local(event) {
    const rect = section.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function onMove(event) {
    if (!interactive || !ctx || rippleOnly) return;
    pointer = local(event);
    start();
  }
  function onLeave() {
    pointer = null;
  }
  function onDown(event) {
    if (!interactive || !ctx) return;
    // não distrai quem está digitando no formulário
    if (event.target.closest('input, textarea, select')) return;
    const p = local(event);
    rings.push({ x: p.x, y: p.y, r: 0 });
    if (rings.length > 4) rings.shift();
    heatAround(p.x, p.y, 70, 1);
    start();
  }

  section.addEventListener('pointermove', onMove, { passive: true });
  section.addEventListener('pointerleave', onLeave);
  section.addEventListener('pointerdown', onDown, { passive: true });

  return {
    setNear(value) {
      if (value === near) return;
      near = value;
      if (near) {
        build();
        if (!rippleOnly) start();
        // a revelação das seções desloca os textos ao entrar: remarca depois
        setTimeout(() => { if (near && ctx) { markText(); drawAll(); } }, 1400);
      }
      else release();
    },
    setVisible(value) {
      visible = value;
      if (visible && !rippleOnly) start();
    },
    resize() {
      if (!near) return;
      const w = Math.round(section.getBoundingClientRect().width);
      const h = Math.round(section.offsetHeight);
      if (w !== width || Math.abs(h - height) > 2) build();
    },
    redraw() {
      // a fonte pode ter mudado a posição dos textos: remarca antes
      markText();
      drawAll();
    },
    setInteractive(value) {
      interactive = value;
      if (value && !rippleOnly) start();
      else {
        stop();
        pointer = null;
        rings.length = 0;
        if (heat) heat.fill(0);
        drawAll();
      }
    },
  };
}

/**
 * Cria o campo nas seções indicadas. Retorna { enable, disable } para
 * seguir a preferência de movimento do site.
 * options.rippleOnly: só a onda do clique (usado na Hero).
 */
export function createCodeField(sections, options = {}) {
  const fields = new Map();
  for (const section of sections) {
    if (section) fields.set(section, createField(section, options));
  }
  if (!fields.size) return { enable() {}, disable() {} };

  // Só aloca o canvas das seções perto da tela
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) fields.get(entry.target)?.setNear(entry.isIntersecting);
    }, { rootMargin: '300px 0px' });
    // …e só anima as que estão de fato na tela. intersectionRatio > 0 (e não
    // isIntersecting): uma seção que só encosta na borda da tela, como a logo
    // abaixo da Hero, conta como "intersectando" mas não aparece
    const seen = new IntersectionObserver((entries) => {
      for (const entry of entries) fields.get(entry.target)?.setVisible(entry.intersectionRatio > 0);
    }, { threshold: [0, 0.01] });
    fields.forEach((_, section) => {
      io.observe(section);
      seen.observe(section);
    });
  } else {
    fields.forEach((field) => {
      field.setNear(true);
      field.setVisible(true);
    });
  }

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) fields.get(entry.target)?.resize();
    });
    fields.forEach((_, section) => ro.observe(section));
  }

  // Redesenha com a fonte certa assim que ela carregar, e ao trocar o tema
  const redrawAll = () => fields.forEach((field) => field.redraw());
  document.fonts?.load(`14px ${FONT}`).then(redrawAll).catch(() => {});
  document.addEventListener('atomuz:themechange', redrawAll);
  // textos mudam de tamanho ao trocar o idioma: remarca a área atrás deles
  document.addEventListener('atomuz:langchange', redrawAll);

  return {
    enable() { fields.forEach((field) => field.setInteractive(true)); },
    disable() { fields.forEach((field) => field.setInteractive(false)); },
  };
}
