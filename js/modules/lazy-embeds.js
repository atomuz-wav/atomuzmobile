/* =========================================================================
   PLAYERS SOB DEMANDA (Spotify e SoundCloud)
   -------------------------------------------------------------------------
   Os players externos pesam muito (cada um baixa e executa centenas de KB
   de JavaScript próprio). O `loading="lazy"` do navegador não basta: como a
   seção MÚSICA fica logo abaixo da Hero, o Chrome e o Safari já os carregam
   na abertura, disputando rede e processador com a sequência de entrada.

   Aqui o iframe nasce com `data-src` (sem `src`) e só recebe o endereço:
   - depois que a página terminou de carregar (evento load), E
   - quando a área do player chega perto da tela (~600 px antes).

   Sem IntersectionObserver (navegadores muito antigos), carrega logo após o
   load. Sem JavaScript, os botões "ABRIR" continuam levando às plataformas.
   ========================================================================= */
export function initLazyEmbeds(root = document) {
  const frames = [...root.querySelectorAll('iframe[data-src]')];
  if (!frames.length) return;

  const load = (frame) => {
    if (!frame.dataset.src) return;
    // esconde o aviso "CARREGANDO PLAYER…" quando o player terminar de abrir
    frame.addEventListener('load', () => frame.parentElement?.classList.add('is-loaded'), { once: true });
    frame.src = frame.dataset.src;
    frame.removeAttribute('data-src');
  };

  const start = () => {
    if (!('IntersectionObserver' in window)) {
      frames.forEach(load);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        load(entry.target);
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '600px 0px' });
    frames.forEach((frame) => observer.observe(frame));
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
