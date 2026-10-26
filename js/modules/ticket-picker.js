/* =========================================================================
   JANELINHA DE INGRESSOS (seção AO VIVO · próximas datas)
   -------------------------------------------------------------------------
   O botão INGRESSOS abre um <dialog> (já escrito no HTML, então o i18n
   traduz os textos) com as duas formas de comprar: WhatsApp e Sympla.
   - Esc fecha e o foco fica preso dentro dele (o próprio <dialog> cuida).
   - Clicar fora do painel ou no X fecha; o foco volta ao botão.
   ========================================================================= */
export function initTicketPicker(root = document) {
  const dialog = root.querySelector('#tickets-dialog');
  const opener = root.querySelector('[data-tickets-open]');
  if (!dialog || !opener || typeof dialog.showModal !== 'function') {
    // Sem suporte a <dialog>: o botão some para não parecer quebrado
    opener?.setAttribute('hidden', '');
    return;
  }

  opener.addEventListener('click', () => {
    document.documentElement.classList.add('is-viewing');   // trava a rolagem
    dialog.showModal();
  });

  dialog.querySelector('[data-tickets-close]')?.addEventListener('click', () => dialog.close());

  // Clique no fundo escuro (fora do painel) fecha
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('is-viewing');
    opener.focus({ preventScroll: true });
  });
}
