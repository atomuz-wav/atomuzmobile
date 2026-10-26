/* =========================================================================
   FORMULÁRIO DE BOOKING (FormSubmit)
   -------------------------------------------------------------------------
   Envia os dados para o endpoint AJAX do FormSubmit sem sair da página e
   mostra o resultado na área de status (lida por leitores de tela).
   Se o JS falhar, o formulário continua funcionando pelo `action` do HTML.

   O endereço vem do próprio `action` do formulário, então para trocar o
   e-mail (ou usar o código que o FormSubmit gera após a ativação) basta
   editar o HTML.
   ========================================================================= */
import { t } from './i18n.js';

const BOOKING_EMAIL = 'atomuz.audio@gmail.com';

export function initBookingForm(form) {
  if (!form) return;
  const status = form.querySelector('[data-booking-status]');
  const button = form.querySelector('button[type="submit"]');
  const label = form.querySelector('[data-submit-label]');
  // rótulo de repouso no idioma atual (pode mudar depois do carregamento)
  const idleLabel = () => t('ENVIAR SOLICITAÇÃO');

  // https://formsubmit.co/<destino>  →  https://formsubmit.co/ajax/<destino>
  const endpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

  function setStatus(type, html) {
    status.className = `booking-form__status${type ? ` is-${type}` : ''}`;
    status.innerHTML = html;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.classList.add('was-submitted');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    button.disabled = true;
    if (label) label.textContent = t('ENVIANDO…');
    setStatus('', '');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await response.json().catch(() => ({}));
      // o FormSubmit responde { success: "true" | "false", message }
      if (!response.ok || String(data.success) === 'false') throw new Error(data.message || response.status);

      form.reset();
      form.classList.remove('was-submitted');
      setStatus('success', t('Solicitação enviada! Obrigado — a resposta chega no e-mail informado.'));
    } catch (error) {
      console.warn('[ATOMUZ] Falha no envio do booking:', error);
      setStatus('error', `${t('Não foi possível enviar agora. Tente de novo ou escreva para')} <a href="mailto:${BOOKING_EMAIL}">${BOOKING_EMAIL}</a>.`);
    } finally {
      button.disabled = false;
      if (label) label.textContent = idleLabel();
    }
  });
}
