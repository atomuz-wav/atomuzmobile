/**
 * Gerador pseudoaleatório com semente (mulberry32).
 * Com a mesma semente, a composição (partículas, caracteres do logo) é
 * sempre idêntica — importante para comparar com a referência e para que
 * o layout não "mude" a cada recarregamento.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Número com distribuição normal (Box–Muller), média 0 e desvio 1. */
export function gaussian(rand) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const lerp = (a, b, t) => a + (b - a) * t;

export const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
