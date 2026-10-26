import { fx, resetFx } from '../core/state.js';

/* =========================================================================
   TRANSIÇÃO DO BOTÃO ENTER (≈ 1,4 s)
   -------------------------------------------------------------------------
   1. O núcleo aumenta de luminosidade.
   2. As órbitas aceleram (o átomo tem relógio próprio — fx.orbitBoost).
   3. Uma onda de energia sai do núcleo e atravessa o campo de partículas.
   4. A interface desaparece com fade e um leve movimento para cima.
   5. A página rola suavemente até a próxima seção, que recebe o foco.

   Sem GSAP, com movimento reduzido ou com as animações pausadas, o link
   funciona como âncora comum (#explorar): salto direto, sem animação.
   ========================================================================= */

export function setupEnterTransition({ gsap, link, frame, canvas, isMotionOff = () => false }) {
  const target = document.querySelector(link?.getAttribute('href') || '');
  if (!link || !target) return;
  const heading = target.querySelector('h2, h1, [tabindex]') || target;
  let busy = false;

  link.addEventListener('click', (event) => {
    if (!gsap || isMotionOff()) {
      // Âncora nativa; só garante o foco na seção de destino
      requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      return;
    }

    event.preventDefault();
    if (busy) return;
    busy = true;

    const root = document.documentElement;
    const maxScroll = root.scrollHeight - window.innerHeight;
    const scroller = { y: window.scrollY };
    // desconta a navbar fixa (scroll-padding-top do CSS)
    const navPad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const targetY = Math.min(target.getBoundingClientRect().top + window.scrollY - navPad, maxScroll);

    // O scroll-behavior: smooth do CSS brigaria com o scroll quadro a quadro
    root.style.scrollBehavior = 'auto';

    const tl = gsap.timeline({ onComplete: finish });

    // 1 e 2 · núcleo e órbitas
    tl.to(fx, { coreBoost: 1, duration: 0.25, ease: 'power2.out' }, 0)
      .to(fx, { coreBoost: 0, duration: 0.9, ease: 'power2.inOut' }, 0.25)
      .to(fx, { orbitBoost: 1, duration: 0.3, ease: 'power2.out' }, 0)
      .to(fx, { orbitBoost: 0, duration: 1.0, ease: 'power2.inOut' }, 0.3);

    // 3 · onda no campo de partículas
    tl.fromTo(fx, { waveRadius: 0, waveStrength: 1 }, { waveRadius: 2600, waveStrength: 0, duration: 1.2, ease: 'power1.out' }, 0.05);

    // feedback de clique no botão
    tl.to(link, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0);

    // 4 · interface some
    tl.to(frame, { autoAlpha: 0, y: -18, duration: 0.55, ease: 'power2.in' }, 0.35)
      .to(canvas(), { opacity: 0.25, duration: 0.55, ease: 'power1.in' }, 0.35);

    // 5 · rolagem até a próxima seção
    tl.to(scroller, {
      y: targetY,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => window.scrollTo(0, scroller.y),
    }, 0.6);

    function finish() {
      // A Hero já está fora da tela: restaura tudo para quando o usuário voltar
      gsap.set([frame, link, canvas()], { clearProps: 'opacity,visibility,transform' });
      root.style.scrollBehavior = '';
      resetFx();
      heading.focus({ preventScroll: true });
      busy = false;
    }
  });
}
