import { t } from './i18n.js';
/* =========================================================================
   DIAGRAMA DO ÁTOMO (seção 05 · VISUAL IDENTITY)
   -------------------------------------------------------------------------
   1. Elétrons: andam pelas órbitas com <animateMotion> (animação nativa do
      SVG). Aqui só controlamos quando ela roda: pausada fora da tela e
      quando o movimento está desligado (reduzido ou pausado pelo visitante).
   2. Parallax: com mouse, o sistema se desloca levemente na direção do cursor.
   3. Partículas binárias (canvas 2D cobrindo a seção): cada partícula é um
      dígito 0 ou 1, que de vez em quando inverte, como um bit mudando.
      - o cursor deixa um rastro de dígitos que se dissolve;
      - o clique/toque libera uma explosão: as partículas são puxadas em
        espiral para o núcleo, com uma onda de choque no ponto do clique,
        e o núcleo brilha quando as absorve.
      O loop só roda enquanto houver partículas vivas — parado, custa zero.
   4. Clique/toque no átomo (ou Enter/Espaço com foco nele): o sistema dá um
      giro completo enquanto se reconstrói do zero (animações no CSS,
      ativadas pela classe .is-rebuilding).
   ========================================================================= */
const MAX_SHIFT = 12;          // parallax máximo, em unidades do SVG (viewBox 400)
const MAX_PARTICLES = 450;     // teto de segurança
const TRAIL_PER_MOVE = 2;      // partículas por movimento do mouse
const BURST_COUNT = 56;        // partículas por clique
const REBUILD_MS = 1500;       // duração da reconstrução (igual ao CSS)
const FLIP_CHANCE = 1.5;       // inversões de bit por segundo (média, por dígito)
const DIGIT_FONT = '"Share Tech Mono", ui-monospace, monospace';

const rand = (min, max) => min + Math.random() * (max - min);
const bit = () => (Math.random() < 0.5 ? '0' : '1');

export function createAtomDiagram(figure) {
  const svg = figure?.querySelector('svg');
  const system = figure?.querySelector('[data-atom-system]');
  if (!svg || !system) return { enable() {}, disable() {} };

  const section = figure.closest('section') || figure;
  const core = figure.querySelector('.atom-diagram__core');
  const canvas = section.querySelector('[data-atom-particles]');
  const ctx = canvas?.getContext('2d');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let enabled = false;
  let inView = false;
  let parallaxFrame = 0;
  const target = { x: 0, y: 0 };

  /* ---------- 1. Elétrons ---------- */
  function syncPlayback() {
    if (enabled && inView) svg.unpauseAnimations?.();
    else svg.pauseAnimations?.();
  }

  /* ---------- 2. Parallax ---------- */
  function renderParallax() {
    parallaxFrame = 0;
    system.style.transform = `translate(${(target.x * MAX_SHIFT).toFixed(2)}px, ${(target.y * MAX_SHIFT).toFixed(2)}px)`;
  }
  function scheduleParallax() {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(renderParallax);
  }

  /* ---------- 3. Partículas ---------- */
  const particles = [];
  const rings = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let loopFrame = 0;
  let last = 0;
  let chargeTimer = 0;

  function resizeCanvas() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = section.clientWidth;
    height = section.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  /** Posição de um ponto da tela em coordenadas da seção (canvas). */
  function toLocal(clientX, clientY) {
    const rect = section.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function nucleusCenter() {
    const r = core.getBoundingClientRect();
    return toLocal(r.left + r.width / 2, r.top + r.height / 2);
  }

  function add(particle) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    particles.push(particle);
  }

  function spawnTrail(x, y) {
    for (let i = 0; i < TRAIL_PER_MOVE; i++) {
      const life = rand(0.6, 1.1);
      add({
        x: x + rand(-3, 3), y: y + rand(-3, 3),
        vx: rand(-40, 40), vy: rand(-40, 40),
        life, maxLife: life, size: Math.round(rand(9, 14)), char: bit(), pull: false,
      });
    }
  }

  function spawnBurst(x, y) {
    for (let i = 0; i < BURST_COUNT; i++) {
      const angle = (i / BURST_COUNT) * Math.PI * 2 + rand(-0.2, 0.2);
      const speed = rand(120, 340);
      const life = rand(1.8, 2.8);
      add({
        x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life, maxLife: life, size: Math.round(rand(10, 16)), char: bit(), pull: true,
        spin: Math.random() < 0.5 ? 1 : -1,   // sentido da espiral
      });
    }
    rings.push({ x, y, r: 0, life: 0.8, maxLife: 0.8 });
  }

  function charge() {
    figure.classList.add('is-charged');
    clearTimeout(chargeTimer);
    chargeTimer = setTimeout(() => figure.classList.remove('is-charged'), 220);
  }

  function color(alpha) {
    // no escuro, verde neon; no claro, o verde tecnológico (aparece melhor no branco)
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return dark ? `rgba(0, 255, 0, ${alpha})` : `rgba(0, 204, 34, ${alpha})`;
  }

  function step(now) {
    loopFrame = 0;
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;

    const c = nucleusCenter();
    let absorbed = false;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

    // Ondas de choque
    for (let i = rings.length - 1; i >= 0; i--) {
      const ring = rings[i];
      ring.life -= dt;
      if (ring.life <= 0) { rings.splice(i, 1); continue; }
      const t = 1 - ring.life / ring.maxLife;
      ring.r = 130 * (1 - (1 - t) ** 3);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = color(0.55 * (1 - t));
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Partículas (dígitos centralizados no ponto da partícula)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontSize = 0;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      if (p.pull) {
        // atração para o núcleo + componente tangencial = espiral
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 12) { particles.splice(i, 1); absorbed = true; continue; }
        const nx = dx / dist;
        const ny = dy / dist;
        p.vx += (nx * 900 - ny * 420 * p.spin) * dt;
        p.vy += (ny * 900 + nx * 420 * p.spin) * dt;
        const damping = Math.exp(-1.8 * dt);
        p.vx *= damping;
        p.vy *= damping;
      } else {
        p.vx *= Math.exp(-2.5 * dt);
        p.vy *= Math.exp(-2.5 * dt);
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (Math.random() < FLIP_CHANCE * dt) p.char = p.char === '0' ? '1' : '0';

      const alpha = Math.min(1, p.life / p.maxLife * 1.4);
      if (p.size !== fontSize) {
        fontSize = p.size;
        ctx.font = `${fontSize}px ${DIGIT_FONT}`;
      }
      ctx.fillStyle = color(alpha * 0.9);
      ctx.fillText(p.char, p.x, p.y);
    }

    if (absorbed) charge();

    if (particles.length || rings.length) loopFrame = requestAnimationFrame(step);
    else { last = 0; ctx.clearRect(0, 0, width, height); }
  }

  function startLoop() {
    if (!ctx || loopFrame || !enabled || !inView) return;
    last = 0;
    loopFrame = requestAnimationFrame(step);
  }

  function clearParticles() {
    particles.length = 0;
    rings.length = 0;
    if (loopFrame) cancelAnimationFrame(loopFrame);
    loopFrame = 0;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    figure.classList.remove('is-charged');
  }

  /* ---------- 4. Reconstrução ---------- */
  let rebuildTimer = 0;
  function rebuild() {
    if (!enabled) return;
    figure.classList.remove('is-rebuilding');
    void figure.offsetWidth;            // reinicia as animações CSS mesmo em cliques seguidos
    figure.classList.add('is-rebuilding');
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => figure.classList.remove('is-rebuilding'), REBUILD_MS);
  }
  function onKey(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    rebuild();
  }

  /* ---------- Eventos ---------- */
  function onMove(event) {
    if (!enabled || event.pointerType !== 'mouse') return;
    const rect = svg.getBoundingClientRect();
    target.x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
    target.y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
    scheduleParallax();

    if (ctx) {
      const p = toLocal(event.clientX, event.clientY);
      spawnTrail(p.x, p.y);
      startLoop();
    }
  }
  function onLeave() {
    target.x = 0;
    target.y = 0;
    scheduleParallax();
  }
  function onDown(event) {
    if (!enabled || !ctx) return;
    // cliques em links/botões continuam normais (sem explosão por cima)
    if (event.target.closest('a, button, iframe')) return;
    const p = toLocal(event.clientX, event.clientY);
    spawnBurst(p.x, p.y);
    startLoop();
    if (svg.contains(event.target)) rebuild();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
      if (!inView) clearParticles();
    }).observe(section);
  } else {
    inView = true;
  }

  if (canvas && 'ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(section);
  resizeCanvas();

  if (finePointer) {
    section.addEventListener('pointermove', onMove, { passive: true });
    section.addEventListener('pointerleave', onLeave);
  }
  section.addEventListener('pointerdown', onDown, { passive: true });

  // rótulo do controle acompanha o idioma do site
  document.addEventListener('atomuz:langchange', () => {
    if (enabled) figure.setAttribute('aria-label', t('Reconstruir o átomo'));
  });

  return {
    enable() {
      enabled = true;
      syncPlayback();
      // o átomo vira um controle acionável pelo teclado
      figure.tabIndex = 0;
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', t('Reconstruir o átomo'));
      figure.addEventListener('keydown', onKey);
    },
    /** Movimento desligado: elétrons parados, sistema centralizado, sem partículas. */
    disable() {
      enabled = false;
      syncPlayback();
      target.x = 0;
      target.y = 0;
      system.style.transform = '';
      clearParticles();
      figure.classList.remove('is-rebuilding');
      figure.removeAttribute('tabindex');
      figure.removeAttribute('role');
      figure.removeAttribute('aria-label');
      figure.removeEventListener('keydown', onKey);
    },
  };
}
