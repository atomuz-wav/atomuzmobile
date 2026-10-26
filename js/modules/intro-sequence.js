import { intro, completeIntro } from '../core/state.js';

/* =========================================================================
   SEQUÊNCIA DE ENTRADA (Initialization Sequence) — GSAP
   -------------------------------------------------------------------------
   1. System Boot ....... pontos de referência e navbar surgem
   2. Particle Field .... a nuvem converge para as ondas; circuitos se desenham
   3. Atomic Core ....... o núcleo acende e as órbitas se fecham
   4. ATOMUZ Identity ... o logotipo surge e uma faixa de luz o atravessa
   5. Interface Online .. navegação, manifesto (letra a letra) e ENTER

   Duração total ≈ 3,2 s. Partes do canvas/SVG animado são controladas pelo
   objeto `intro` (lido pelos sistemas a cada quadro); peças de HTML/SVG
   estático são animadas diretamente pelo GSAP.
   ========================================================================= */

/**
 * Divide o manifesto em caracteres para a revelação letra a letra.
 * Leitores de tela continuam lendo o texto inteiro (cópia acessível oculta).
 */
function splitManifesto(manifesto) {
  if (!manifesto || manifesto.dataset.split) return [];
  const text = [...manifesto.children].map((part) => part.textContent.trim()).join(' ');
  const visual = document.createElement('span');
  visual.className = 'manifesto__visual';
  visual.setAttribute('aria-hidden', 'true');

  for (const part of [...manifesto.children]) {
    const isDot = part.classList.contains('manifesto__dot');
    const group = document.createElement('span');
    group.className = part.className;
    for (const char of part.textContent) {
      const span = document.createElement('span');
      span.className = 'manifesto__char';
      span.textContent = char;
      group.appendChild(span);
    }
    if (isDot) group.removeAttribute('aria-hidden');
    visual.appendChild(group);
  }

  const readable = document.createElement('span');
  readable.className = 'sr-only';
  readable.textContent = text;

  manifesto.replaceChildren(readable, visual);
  manifesto.dataset.split = 'true';
  return [...visual.querySelectorAll('.manifesto__char')];
}

/**
 * Monta e executa a sequência. Retorna { finish } para encerrar na hora
 * (ex.: o usuário ativa "movimento reduzido" no meio da entrada).
 */
export function playIntro(gsap, root = document) {
  const q = (selector) => [...root.querySelectorAll(selector)];

  const hudDots = q('.hud-dots circle');
  // A navbar fica fora da Hero (fixa no topo), então é buscada no documento
  const nav = document.querySelector('.nav');
  const navLine = nav?.querySelector('.nav__line');
  const brand = nav?.querySelector('.nav__brand');
  const social = [...(nav?.querySelectorAll('.nav__social > li') ?? [])];
  const menu = [...(nav?.querySelectorAll('.nav__menu li') ?? [])];
  const spectrum = nav?.querySelector('.nav__spectrum');
  const chars = splitManifesto(root.querySelector('.manifesto'));
  const ornament = root.querySelector('.ornament');
  const enterLines = q('.enter-row__line');
  const enter = root.querySelector('.enter');
  const scrollHint = root.querySelector('.scroll-hint');

  const domTargets = [...hudDots, navLine, spectrum, brand, ...social, ...menu,
    ...chars, ornament, ...enterLines, enter, scrollHint].filter(Boolean);

  // Estado inicial (tudo invisível) — aplicado ANTES de revelar a Hero
  Object.assign(intro, { particles: 0, circuits: 0, core: 0, orbits: 0, logo: 0, sweep: 0 });
  gsap.set([spectrum, brand, ...social, ...menu, ornament, enter, scrollHint].filter(Boolean), { autoAlpha: 0 });
  gsap.set(hudDots, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
  gsap.set(navLine, { clipPath: 'inset(0% 50% 0% 50%)' });
  gsap.set(nav, { '--nav-reveal': 0 });
  gsap.set(chars, { autoAlpha: 0, y: '0.35em' });
  gsap.set(enterLines[0], { scaleX: 0, transformOrigin: '100% 50%' });
  gsap.set(enterLines[1], { scaleX: 0, transformOrigin: '0% 50%' });

  document.documentElement.classList.remove('is-booting');

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: cleanup,
  });

  // 1 · System Boot
  tl.to(hudDots, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: { each: 0.03, from: 'random' }, ease: 'back.out(2)' }, 0.15)
    .to(navLine, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut' }, 0.1)
    .to(nav, { '--nav-reveal': 1, duration: 0.6, ease: 'power2.out' }, 0.75)
    .to(spectrum, { autoAlpha: 1, duration: 0.5 }, 0.9);

  // 2 · Particle Field + circuitos
  tl.to(intro, { particles: 1, duration: 1.6, ease: 'power1.out' }, 0.35)
    .to(intro, { circuits: 1, duration: 1.4, ease: 'none' }, 0.55);

  // 3 · Atomic Core
  tl.to(intro, { core: 1, duration: 0.7, ease: 'back.out(1.6)' }, 1.0)
    .to(intro, { orbits: 1, duration: 1.0, ease: 'power2.inOut' }, 1.15);

  // 4 · ATOMUZ Identity
  tl.to(intro, { logo: 1, duration: 0.8 }, 1.55)
    .to(intro, { sweep: 1, duration: 0.9, ease: 'power1.inOut' }, 1.95);

  // 5 · Interface Online
  tl.to([brand, ...menu, ...social].filter(Boolean), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, startAt: { y: -8 } }, 2.05)
    .to(chars, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.022 }, 2.1)
    .to(ornament, { autoAlpha: 1, duration: 0.5 }, 2.35)
    .to(enterLines, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, 2.5)
    .to(enter, { autoAlpha: 1, y: 0, duration: 0.5, startAt: { y: 10 } }, 2.45)
    .to(scrollHint, { autoAlpha: 1, duration: 0.6 }, 2.9);

  function cleanup() {
    // Devolve o controle ao CSS (hover, foco) e garante o estado final exato
    gsap.set(domTargets, { clearProps: 'all' });
    gsap.set(nav, { clearProps: '--nav-reveal' });
    completeIntro();
  }

  return {
    timeline: tl,
    finish() {
      tl.progress(1);
      tl.kill();
    },
  };
}
