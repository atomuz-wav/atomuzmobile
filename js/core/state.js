/**
 * Estado compartilhado entre os sistemas animados.
 *
 * O GSAP anima ESTES números (não o DOM diretamente); cada sistema lê os
 * valores no seu update() e decide como aplicá-los. Assim a sequência de
 * entrada e a transição do ENTER coordenam partículas (WebGL), átomo (SVG)
 * e circuitos sem que um módulo precise conhecer o outro.
 */

/**
 * Progresso da sequência de entrada (0 = invisível, 1 = pronto).
 * Os valores padrão são 1: sem GSAP ou com movimento reduzido, tudo já
 * aparece no estado final.
 */
export const intro = {
  particles: 1,   // nuvem se materializa e as ondas assumem posição
  circuits: 1,    // trilhas sendo desenhadas
  core: 1,        // núcleo acendendo
  orbits: 1,      // órbitas sendo desenhadas
  logo: 1,        // logotipo surgindo
  sweep: 0,       // faixa de luz que atravessa o logotipo (0 → 1)
};

/** Efeitos momentâneos (transição do ENTER). 0 = repouso. */
export const fx = {
  coreBoost: 0,     // luminosidade extra do núcleo
  orbitBoost: 0,    // aceleração das órbitas
  waveRadius: 0,    // raio da onda no campo de partículas (unidades da referência)
  waveStrength: 0,  // intensidade da onda
};

export function completeIntro() {
  Object.assign(intro, { particles: 1, circuits: 1, core: 1, orbits: 1, logo: 1, sweep: 0 });
}

export function resetFx() {
  Object.assign(fx, { coreBoost: 0, orbitBoost: 0, waveRadius: 0, waveStrength: 0 });
}
