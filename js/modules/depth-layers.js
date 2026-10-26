import { intro } from '../core/state.js';

/* =========================================================================
   CAMADAS DE PROFUNDIDADE (parallax)
   -------------------------------------------------------------------------
   Cada camada se desloca uma quantidade diferente, no sentido oposto ao
   cursor: quanto "mais perto" do observador, mais ela se move. Isso cria
   a sensação de profundidade.

   DESEMPENHO: o deslocamento é feito com `transform` de CSS nos SVGs-camada
   (ver .stage-layer no CSS). A GPU apenas move imagens já desenhadas — os
   brilhos com desfoque do logotipo NÃO são recalculados quando o mouse se
   move. As porcentagens do translate são relativas ao tamanho do palco,
   então 1 % = 20,48 unidades na horizontal e 9 unidades na vertical.

   HUD e circuitos ficam FIXOS de propósito: eles são a "interface" (o vidro
   do monitor), enquanto o sistema atômico flutua atrás.

   Este módulo também aplica a aparição do logotipo e do núcleo durante a
   sequência de entrada (valores de `intro`).
   ========================================================================= */

/** Deslocamento máximo de cada camada (unidades da referência). */
const DEPTH = { orbits: 12, logo: 18 };

const STAGE_W = 2048;
const STAGE_H = 900;
const NUCLEUS_CENTER = [823, 1009]; // ponto central do "O" do logo oficial

/** Deslocamento em unidades da referência → translate3d em % do palco. */
const translate = (x, y) =>
  `translate3d(${((x / STAGE_W) * 100).toFixed(3)}%, ${((y / STAGE_H) * 100).toFixed(3)}%, 0)`;

export function createDepthLayers(stage, interaction) {
  const haze = stage.querySelector('.layer-haze');
  const orbits = stage.querySelector('.layer-orbits');
  const logo = stage.querySelector('.stage-logo');
  const frontUse = stage.querySelector('.layer-orbits-front use');
  const nucleus = stage.querySelector('.layer-nucleus');

  const offset = (amount) => [-interaction.nx * amount, -interaction.ny * amount * 0.6];

  function clear() {
    for (const el of [haze, orbits, logo]) {
      if (!el) continue;
      el.style.transform = '';
      el.style.opacity = '';
    }
    frontUse?.removeAttribute('transform');
    nucleus?.removeAttribute('transform');
    if (nucleus) nucleus.style.opacity = '';
  }

  return {
    update() {
      const [ox, oy] = offset(DEPTH.orbits);
      const [lx, ly] = offset(DEPTH.logo);

      if (haze) haze.style.opacity = intro.logo.toFixed(3);
      if (orbits) orbits.style.transform = translate(ox, oy);

      // Logotipo (halo, corpo e efeitos juntos): parallax + aparição (0,94 → 1)
      // + leve aproximação com o cursor sobre ele
      const scale = (0.94 + 0.06 * intro.logo) * (1 + 0.012 * interaction.logoHover);
      if (logo) {
        logo.style.transform = `${translate(lx, ly)} scale(${scale.toFixed(4)})`;
        logo.style.opacity = intro.logo.toFixed(3);
      }

      // Reflexo das órbitas sobre as letras: está na camada do logo (o recorte
      // segue as letras) e compensa a diferença para acompanhar as órbitas
      frontUse?.setAttribute('transform', `translate(${(ox - lx).toFixed(2)} ${(oy - ly).toFixed(2)})`);

      // Núcleo: só a aparição da entrada (o parallax vem do grupo do logo)
      if (nucleus) {
        const [cx, cy] = NUCLEUS_CENTER;
        const s = 0.15 + 0.85 * intro.core;
        nucleus.setAttribute('transform', `translate(${cx} ${cy}) scale(${s.toFixed(4)}) translate(${-cx} ${-cy})`);
        nucleus.style.opacity = Math.min(1, intro.core * 1.4).toFixed(3);
      }
    },

    reset: clear,
  };
}
