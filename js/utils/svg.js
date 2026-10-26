const SVG_NS = 'http://www.w3.org/2000/svg';

/** Cria um elemento SVG com atributos: svgEl('circle', { r: 4, class: 'dot' }). */
export function svgEl(tag, attrs = {}, children = []) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  for (const child of children) el.appendChild(child);
  return el;
}

/** Interpola duas cores hexadecimais (#RRGGBB) e devolve "rgb(r g b)". */
export function mixColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p, s) => (p >> s) & 255;
  const mix = (s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
  return `rgb(${mix(16)} ${mix(8)} ${mix(0)})`;
}

export const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Desaceleração suave (início rápido, fim suave). */
export const easeOutCubic = (t) => 1 - (1 - t) ** 3;
