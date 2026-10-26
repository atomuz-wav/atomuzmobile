import { mulberry32 } from '../utils/random.js';
import { intro } from '../core/state.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Caracteres da textura digital: só código binário (0 e 1). */
const GLYPHS = '01';

/**
 * TEXTURA DIGITAL DO LOGOTIPO ("chuva" Matrix)
 *
 * Preenche o grupo SVG com colunas de caracteres. O grupo já está recortado
 * pelo contorno do logotipo (clip-path no HTML), então os caracteres só
 * aparecem dentro das letras.
 *
 * Cada coluna é UM único <text> com listas de posições x/y (um glifo por
 * posição) — muito mais leve que um elemento por caractere.
 *
 * Como a chuva é contínua sem "pulos": o padrão de cada coluna tem altura P
 * e é desenhado DUAS vezes, uma acima da outra. A coluna desce de 0 até P e
 * volta a 0 — nesse instante a cópia de cima ocupa exatamente o lugar da de
 * baixo, então o recomeço é invisível. Em t = 0 a textura é igual à estática.
 *
 * @param {SVGGElement} group
 * @param {object} [options]
 */
export function createLogoMatrix(group, {
  seed = 7,
  // caixa do logo oficial (coordenadas da referência), com folga
  bounds = { x0: 184, x1: 1862, y0: 920, y1: 1100 },
  // passo menor que na versão antiga: os traços do logo oficial são finos
  colStep = 11,
  rowStep = 11,
} = {}) {
  const rand = mulberry32(seed);
  const rows = Math.ceil((bounds.y1 - bounds.y0) / rowStep) + 1;
  const period = rows * rowStep;
  const fragment = document.createDocumentFragment();
  const columns = [];

  for (let x = bounds.x0 + colStep / 2; x < bounds.x1; x += colStep) {
    // Padrão da coluna: trechos "ligados" e "desligados" criam falhas
    const pattern = [];
    let on = rand() < 0.65;
    let remaining = runLength(on, rand);
    for (let r = 0; r < rows; r++) {
      if (remaining-- <= 0) {
        on = !on;
        remaining = runLength(on, rand);
      }
      pattern.push(on ? GLYPHS[Math.floor(rand() * GLYPHS.length)] : null);
    }

    const offset = rand() * rowStep;
    const xs = [];
    const ys = [];
    let chars = '';
    for (const copy of [-1, 0]) {
      pattern.forEach((glyph, r) => {
        if (!glyph) return;
        xs.push(x.toFixed(1));
        ys.push((bounds.y0 + offset + r * rowStep + copy * period).toFixed(1));
        chars += glyph;
      });
    }

    const opacity = (0.6 + rand() * 0.4).toFixed(2);
    const speed = 9 + rand() * 15;              // unidades/s (≈ 0,6 a 1,6 linha por segundo)
    if (!chars) continue;

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', xs.join(' '));
    text.setAttribute('y', ys.join(' '));
    text.setAttribute('opacity', opacity);
    text.textContent = chars;
    fragment.appendChild(text);

    columns.push({ el: text, speed, original: chars, chars: [...chars] });
  }

  group.replaceChildren(fragment);

  // Troca ocasional de caracteres (dá vida à textura). Aleatório "de verdade"
  // aqui não importa: não afeta a composição estática.
  let nextMutation = 0;

  function mutate(time) {
    if (time < nextMutation) return;
    nextMutation = time + 0.09;
    const col = columns[Math.floor(Math.random() * columns.length)];
    const half = col.chars.length / 2;          // as duas cópias têm o mesmo tamanho
    const i = Math.floor(Math.random() * half);
    const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    col.chars[i] = glyph;
    col.chars[i + half] = glyph;                // mantém as cópias idênticas
    col.el.textContent = col.chars.join('');
  }

  return {
    update(time) {
      for (const col of columns) {
        const y = (time * col.speed) % period;
        col.el.setAttribute('transform', `translate(0 ${y.toFixed(2)})`);
      }
      if (time > 0) mutate(time);
    },

    reset() {
      nextMutation = 0;
      for (const col of columns) {
        col.el.removeAttribute('transform');
        col.chars = [...col.original];
        col.el.textContent = col.original;
      }
    },
  };
}

function runLength(on, rand) {
  return on ? 3 + Math.floor(rand() * 9) : 1 + Math.floor(rand() * 2);
}

/* =========================================================================
   REVELAÇÃO DA CHUVA NO LOGO
   -------------------------------------------------------------------------
   O logo fica verde neon (legível, inclusive no celular). A chuva binária só
   aparece em momentos: as letras escurecem, a borda acende por dentro e os
   0/1 descem —
     1. na entrada: enquanto o logo surge e ~0,9 s depois;
     2. com o cursor sobre o logo;
     3. por ~1,4 s a cada clique/toque na Hero.
   O nível (0–1) vai para a variável CSS --matrix no grupo do logo; o CSS
   cruza o corpo verde com o escuro. A chuva só é animada enquanto aparece.
   ========================================================================= */
const INTRO_HOLD = 0.9;   // s — a chuva fica depois que o logo termina de surgir
const CLICK_HOLD = 1.4;   // s — duração da revelação por clique
const RISE = 7;           // velocidade para acender (1/s)
const FALL = 2.2;         // velocidade para apagar (1/s)

export function createLogoReveal(logoEl, matrix, interaction, hero) {
  let level = 0;
  let shown = -1;
  let introDone = null;
  let clickAt = -Infinity;
  let clicked = false;

  hero?.addEventListener('pointerdown', () => { clicked = true; }, { passive: true });

  function set(value) {
    if (Math.abs(value - shown) < 0.002) return;
    shown = value;
    logoEl.style.setProperty('--matrix', value.toFixed(3));
  }

  function reset() {
    level = 0;
    introDone = null;
    clickAt = -Infinity;
    clicked = false;
    set(0);
    matrix.reset();
  }

  return {
    update(time, delta = 0) {
      if (time === 0) { reset(); return; }
      if (clicked) { clickAt = time; clicked = false; }

      // 1. entrada: enquanto o logo surge e um pouco depois
      let target = 0;
      if (intro.logo < 1) { introDone = null; target = 1; }
      else {
        if (introDone === null) introDone = time;
        if (time < introDone + INTRO_HOLD) target = 1;
      }
      // 2. cursor sobre o logo · 3. clique recente
      if ((interaction?.logoHover ?? 0) > 0.5) target = 1;
      if (time - clickAt < CLICK_HOLD) target = 1;

      const rate = target > level ? RISE : FALL;
      level += (target - level) * (1 - Math.exp(-rate * delta));
      if (level < 0.005 && target === 0) level = 0;
      set(level);
      if (level > 0) matrix.update(time);
    },
    reset,
  };
}
