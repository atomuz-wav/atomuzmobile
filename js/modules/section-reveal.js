/* =========================================================================
   REVELAÇÃO DAS SEÇÕES AO ROLAR
   -------------------------------------------------------------------------
   Elementos com [data-reveal] surgem (fade + leve subida) quando entram na
   tela. Usa IntersectionObserver — nada roda a cada quadro.

   A ocultação inicial só existe enquanto a classe .reveal-on está no <html>
   (ver CSS). Sem JS, com movimento reduzido ou com as animações pausadas,
   todo o conteúdo aparece direto.
   ========================================================================= */
export function createSectionReveal(root = document) {
  const items = [...root.querySelectorAll('[data-reveal]')];
  const html = document.documentElement;
  let observer = null;

  function showAll() {
    observer?.disconnect();
    observer = null;
    for (const el of items) el.classList.add('is-visible');
  }

  return {
    /** Liga a revelação para o que ainda não apareceu. */
    enable() {
      if (!('IntersectionObserver' in window)) { showAll(); return; }
      if (observer) return;
      html.classList.add('reveal-on');
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      for (const el of items) {
        if (!el.classList.contains('is-visible')) observer.observe(el);
      }
    },

    /** Movimento desligado: mostra tudo imediatamente. */
    disable() {
      showAll();
      html.classList.remove('reveal-on');
    },
  };
}
