/* =========================================================================
   ONDA LÍQUIDA NAS FOTOS (inspirada nos cartões de notícias do Boom Festival)
   -------------------------------------------------------------------------
   Com o mouse em cima de uma foto, um <canvas> aparece por cima dela e
   redesenha a imagem em faixas horizontais finas; cada faixa é deslocada
   para o lado por uma onda senoidal que corre com o tempo. O resultado são
   linhas verticais "derretendo", e nas bordas a onda deixa à mostra o
   fundo verde do cartão (os entalhes ondulados).

   - Só em computador: mouse/trackpad de precisão e tela sem toque. Celulares
     e tablets (inclusive iPad com teclado/trackpad) ficam sem o efeito.
   - O canvas só é criado no primeiro hover e só anima enquanto o mouse está
     em cima (mais o tempo do fade de saída): nenhuma foto parada gasta CPU.
   - Movimento reduzido / botão de pausa: disable() desliga tudo.
   ========================================================================= */

const STRIP = 2;           // px (CSS) — altura de cada faixa redesenhada
const AMPLITUDE = 0.04;    // deslocamento máximo, em fração da largura
const OVERSCAN = 0.025;    // a imagem sobra 2,5 % de cada lado: os entalhes
                           // só aparecem nos picos da onda, como no Boom
const WAVELENGTH = 0.12;   // comprimento de uma onda, em fração da altura
const SPEED = 0.0025;      // rad/ms — velocidade com que a onda corre
const FADE_MS = 500;       // igual à transição de opacidade no CSS

const desktopQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

/** Computador "de verdade": mouse fino e nenhum ponto de toque. */
export const isDesktopPointer = () => desktopQuery.matches && !navigator.maxTouchPoints;

/**
 * @param {Array<{ host: Element, img: HTMLImageElement }>} targets
 *   host = elemento que recebe o hover e o canvas; img = foto a distorcer
 */
export function createImageWave(targets) {
  const root = document.documentElement;
  let enabled = false;

  const entries = targets.filter((t) => t.host && t.img).map(({ host, img }) => {
    const entry = { host, img, source: null, canvas: null, ctx: null, raf: 0, start: 0, stopAt: 0 };
    host.addEventListener('mouseenter', () => enabled && play(entry));
    host.addEventListener('mouseleave', () => {
      host.classList.remove('is-waving');
      if (entry.raf) entry.stopAt = performance.now() + FADE_MS;
    });
    return entry;
  });

  function ensureCanvas(entry) {
    if (entry.canvas) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'wave-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    // logo depois do <picture> (ou da foto): fica abaixo do botão "ver"
    (entry.img.closest('picture') || entry.img).after(canvas);
    entry.canvas = canvas;
    entry.ctx = canvas.getContext('2d');
  }

  /* Com srcset, o naturalWidth do <img> vem "corrigido" pela densidade (a
     capa de 1000 px aparece como 420) e o recorte das faixas sairia
     ampliado. Por isso a onda desenha de uma cópia simples da mesma fonte
     (AVIF/WebP/JPG que o navegador escolheu), que já está no cache. */
  function ensureSource(entry) {
    const src = entry.img.currentSrc || entry.img.src;
    if (entry.source?.src === src) return entry.source;
    const source = new Image();
    source.decoding = 'async';
    source.src = src;
    entry.source = source;
    return source;
  }

  function resize(entry) {
    const { canvas } = entry;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    entry.dpr = dpr;
  }

  function draw(entry, time) {
    const { ctx, source: img, canvas } = entry;
    if (!img.complete || !img.naturalWidth) return;
    const W = canvas.width;
    const H = canvas.height;
    const strip = STRIP * entry.dpr;
    const scaleY = img.naturalHeight / H;
    const amp = W * AMPLITUDE;
    const wave = (Math.PI * 2) / (H * WAVELENGTH);
    const phase = time * SPEED;
    const drawW = W * (1 + OVERSCAN * 2);
    const left = -W * OVERSCAN;

    ctx.clearRect(0, 0, W, H);
    for (let y = 0; y < H; y += strip) {
      const x = amp * Math.sin(y * wave + phase);
      ctx.drawImage(img, 0, y * scaleY, img.naturalWidth, strip * scaleY, left + x, y, drawW, strip);
    }
  }

  function play(entry) {
    const { img, host } = entry;
    // Foto ainda carregando (lazy): tenta de novo quando chegar, se o mouse
    // continuar em cima
    if (!img.complete || !img.naturalWidth) {
      img.addEventListener('load', () => enabled && host.matches(':hover') && play(entry), { once: true });
      return;
    }
    ensureCanvas(entry);
    const source = ensureSource(entry);
    if (!source.complete) {
      source.addEventListener('load', () => enabled && host.matches(':hover') && play(entry), { once: true });
      return;
    }
    resize(entry);
    entry.stopAt = 0;
    // O CSS só troca a foto pelo canvas com esta classe, ou seja, quando já
    // existe um quadro da onda para mostrar
    draw(entry, entry.raf ? performance.now() - entry.start : 0);
    host.classList.add('is-waving');
    if (entry.raf) return;                    // já animando (saiu e voltou no fade)
    entry.start = performance.now();
    const tick = (now) => {
      if (entry.stopAt && now >= entry.stopAt) {
        entry.raf = 0;
        return;
      }
      draw(entry, now - entry.start);
      entry.raf = requestAnimationFrame(tick);
    };
    entry.raf = requestAnimationFrame(tick);
  }

  function stopAll() {
    for (const entry of entries) {
      entry.host.classList.remove('is-waving');
      cancelAnimationFrame(entry.raf);
      entry.raf = 0;
    }
  }

  // Aba escondida: o navegador já segura o rAF, mas o mouseleave pode não
  // chegar; ao voltar, nenhuma foto fica presa ondulando
  document.addEventListener('visibilitychange', () => document.hidden && stopAll());

  return {
    enable() {
      if (!entries.length || !isDesktopPointer()) return;
      enabled = true;
      root.classList.add('has-wave');
    },
    disable() {
      enabled = false;
      root.classList.remove('has-wave');
      stopAll();
    },
  };
}
