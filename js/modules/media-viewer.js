import { t } from './i18n.js';

/* =========================================================================
   VISUALIZADOR DE FOTOS (seção MÍDIA)
   -------------------------------------------------------------------------
   1. Cada foto ganha um botão invisível por cima: no hover (ou foco pelo
      teclado) a foto escurece e aparece um ícone de olho no centro. Em telas
      de toque o olho só aparece na foto sob o dedo.
   2. Clique/toque abre a foto grande num <dialog> (tela cheia escura), com
      contador, setas e botão fechar.
      - Teclado: ← → navegam, Esc fecha (o próprio <dialog> cuida do Esc e
        mantém o foco dentro dele).
      - Celular: deslizar para o lado troca de foto.
      - Clicar fora da foto fecha.
   As cópias do loop (aria-hidden) abrem a mesma foto original, mas ficam
   fora da ordem do Tab para não duplicar a navegação por teclado.
   ========================================================================= */
const SWIPE_MIN = 50;   // px — deslize mínimo para trocar de foto
const EYE_LINGER = 900; // ms — tempo que o olho fica depois que o dedo sai

const EYE_SVG = `
  <svg class="media-item__eye" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M3 24C9 13 16 8 24 8s15 5 21 16c-6 11-13 16-21 16S9 35 3 24Z"/>
    <circle cx="24" cy="24" r="8.5"/>
    <circle class="media-item__pupil" cx="24" cy="24" r="3.4"/>
  </svg>`;

export function createMediaViewer(section) {
  const items = section ? [...section.querySelectorAll('.media-item')] : [];
  if (!items.length || typeof HTMLDialogElement === 'undefined') return;

  // Fotos únicas (na ordem da página); as cópias apontam para a original
  const photos = [];
  const indexBySrc = new Map();
  for (const item of items) {
    const img = item.querySelector('img');
    const src = img.getAttribute('src');
    if (!indexBySrc.has(src)) {
      indexBySrc.set(src, photos.length);
      photos.push(img);
    }
  }

  // Formato que o navegador escolheu no <picture> (avif, webp ou jpg), lido de
  // qualquer foto já carregada: a tela cheia abre a versão grande (1600 px)
  // nesse mesmo formato, e não o JPG, que pesa 2 a 3 vezes mais
  let format = null;
  function largeSrc(img) {
    if (!format) {
      const loaded = items.map((item) => item.querySelector('img').currentSrc).find(Boolean);
      format = loaded?.match(/\.(avif|webp|jpg)(?:\?|$)/)?.[1] ?? null;
    }
    const src = img.getAttribute('src');
    return format ? src.replace(/\.jpg$/, `.${format}`) : src;
  }

  /* ---------- 1. Botões com o olho ---------- */
  const buttons = items.map((item) => {
    const img = item.querySelector('img');
    const clone = item.classList.contains('media-item--clone');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'media-item__view';
    button.innerHTML = EYE_SVG;
    if (clone) button.tabIndex = -1;
    button.addEventListener('click', () => open(indexBySrc.get(img.getAttribute('src')), button));
    item.append(button);
    return { button, img };
  });

  function labelButtons() {
    // o alt da foto já é traduzido pelo i18n; aqui só o prefixo
    for (const { button, img } of buttons) button.setAttribute('aria-label', `${t('Ampliar foto')}: ${img.alt}`);
  }

  /* Olho sob o dedo. Usa eventos de toque (e não :hover ou :active) porque
     cada navegador trata esses estados de um jeito no celular: o Safari quase
     não os aplica e o Chrome/Firefox os deixam grudados depois do toque.
     elementFromPoint acha a foto sob o dedo, já que o touchmove sempre aponta
     para o elemento onde o toque começou */
  let touched = null;
  let lingerId = 0;

  function touchItem(item) {
    clearTimeout(lingerId);
    if (item === touched) return;
    touched?.classList.remove('is-touched');
    item?.classList.add('is-touched');
    touched = item;
  }

  function itemUnder(touch) {
    return document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.media-item') ?? null;
  }

  function releaseTouch(event) {
    if (event.touches.length) return;
    clearTimeout(lingerId);
    lingerId = setTimeout(touchItem, EYE_LINGER, null);
  }

  // Só no celular/tablet: computadores (mesmo com tela de toque) têm hover
  // e mantêm o olho do mouse, sem nenhuma mudança
  if (matchMedia('(hover: none)').matches) {
    section.classList.add('is-touch');
    const onTouch = (event) => touchItem(itemUnder(event.touches[0]));
    section.addEventListener('touchstart', onTouch, { passive: true });
    section.addEventListener('touchmove', onTouch, { passive: true });
    section.addEventListener('touchend', releaseTouch, { passive: true });
    section.addEventListener('touchcancel', releaseTouch, { passive: true });
  }

  /* ---------- 2. Visualizador ---------- */
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-viewer';
  dialog.innerHTML = `
    <figure class="photo-viewer__figure">
      <img class="photo-viewer__img" alt="">
      <figcaption class="photo-viewer__caption">
        <span class="photo-viewer__count"></span>
      </figcaption>
    </figure>
    <button class="photo-viewer__btn photo-viewer__btn--close" type="button" data-viewer="close">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
    </button>
    <button class="photo-viewer__btn photo-viewer__btn--prev" type="button" data-viewer="prev">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8"/></svg>
    </button>
    <button class="photo-viewer__btn photo-viewer__btn--next" type="button" data-viewer="next">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8"/></svg>
    </button>`;
  document.body.append(dialog);

  const view = dialog.querySelector('.photo-viewer__img');
  const count = dialog.querySelector('.photo-viewer__count');
  const controls = {
    close: dialog.querySelector('[data-viewer="close"]'),
    prev: dialog.querySelector('[data-viewer="prev"]'),
    next: dialog.querySelector('[data-viewer="next"]'),
  };
  let current = 0;
  let opener = null;

  function labelControls() {
    controls.close.setAttribute('aria-label', t('Fechar'));
    controls.prev.setAttribute('aria-label', t('Foto anterior'));
    controls.next.setAttribute('aria-label', t('Próxima foto'));
  }

  function show(index) {
    current = (index + photos.length) % photos.length;
    const img = photos[current];
    view.src = largeSrc(img);                    // versão grande (1600 px)
    view.alt = img.alt;   // descrição só para leitores de tela (não aparece)
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    // pré-carrega as vizinhas para a troca ser imediata
    for (const step of [-1, 1]) {
      const next = photos[(current + step + photos.length) % photos.length];
      new Image().src = largeSrc(next);
    }
  }

  function open(index, from) {
    opener = from;
    labelControls();
    show(index);
    document.documentElement.classList.add('is-viewing');
    dialog.showModal();
    controls.close.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('is-viewing');
    // devolve o foco à foto (se ela não for uma cópia escondida)
    if (opener && opener.tabIndex !== -1) opener.focus({ preventScroll: true });
  });

  controls.close.addEventListener('click', close);
  controls.prev.addEventListener('click', () => show(current - 1));
  controls.next.addEventListener('click', () => show(current + 1));

  // clicar no fundo escuro (fora da foto e dos botões) fecha
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.classList.contains('photo-viewer__figure')) close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });

  // deslizar no celular
  let startX = null;
  dialog.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') startX = event.clientX;
  });
  dialog.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) >= SWIPE_MIN) show(current + (dx < 0 ? 1 : -1));
  });

  labelButtons();
  document.addEventListener('atomuz:langchange', () => {
    labelButtons();
    labelControls();
    if (dialog.open) show(current);
  });
}
