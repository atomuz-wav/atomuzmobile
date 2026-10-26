/**
 * Preferência de movimento reduzido (acessibilidade).
 * Pessoas com labirintite, enxaqueca ou sensibilidade a movimento ativam
 * essa opção no sistema; nesse caso a Hero fica estática (como na Etapa 1).
 */
const query = window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => query.matches;

/** Executa `callback(reduce)` sempre que a preferência mudar. */
export function onMotionPreferenceChange(callback) {
  query.addEventListener('change', () => callback(query.matches));
}
