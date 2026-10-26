/* =========================================================================
   IDIOMA (português ⇄ inglês)
   -------------------------------------------------------------------------
   O HTML é escrito em português. Ao iniciar, este módulo percorre a página
   e guarda cada texto (e os atributos aria-label, alt e title) que tem
   tradução no dicionário abaixo — a chave é o texto em português, com os
   espaços normalizados. Trocar o idioma só troca esses textos de lugar;
   voltar ao português restaura o original.

   - Botão com bandeira na navbar ([data-lang-toggle]); a escolha fica
     salva no navegador (localStorage 'atomuz:lang').
   - t('texto em português') devolve o texto no idioma atual (usado pelos
     módulos que escrevem textos via JS, como o formulário de booking).
   - Dispara 'atomuz:langchange' para quem depende da posição dos textos
     (ex.: o fundo de caracteres, que fica mais ralo atrás deles).

   Para traduzir um texto novo: adicione a linha 'português': 'english'.
   ========================================================================= */
const EN = {
  // Navegação e Hero
  'Pular introdução': 'Skip intro',
  'ROLE PARA EXPLORAR': 'SCROLL TO EXPLORE',
  'MÚSICA': 'MUSIC',
  'AO VIVO': 'LIVE',
  'SOBRE': 'ABOUT',
  'MÍDIA': 'MEDIA',
  'Pausar animações': 'Pause animations',
  'Seções do site': 'Site sections',
  'Redes sociais': 'Social media',
  'ATOMUZ — início': 'ATOMUZ — home',
  'Tema escuro': 'Dark theme',

  // 01 · Projeto
  '/ O PROJETO': '/ THE PROJECT',
  'PROJETO': 'PROJECT',
  'Atomuz é um projeto de progressive psytrance e zenonesque que explora o':
    'Atomuz is a progressive psytrance and zenonesque project that explores',
  'som, ciência, tecnologia e consciência.': 'sound, science, technology and consciousness.',
  'Criado por Luiz Felipe, o projeto explora as profundezas da mente através de paisagens sonoras psicodélicas e imersivas — batidas hipnóticas, falhas interestelares, melodias marcantes e linhas de baixo profundas, inspiradas pela ciência, tecnologia e ficção científica.':
    'Created by Luiz Felipe, the project explores the depths of the mind through psychedelic, immersive soundscapes — hypnotic beats, interstellar glitches, striking melodies and deep basslines, inspired by science, technology and science fiction.',
  'A música é tratada como uma exploração de sistemas: precisa, imersiva e audiovisual, com uma linguagem futurista baseada em psicodelia.':
    'Music is treated as an exploration of systems: precise, immersive and audiovisual, with a futuristic language rooted in psychedelia.',
  'Ficha do projeto': 'Project profile',
  'PERFIL DO SISTEMA': 'SYSTEM PROFILE',
  'ARTISTA': 'ARTIST',
  'ORIGEM': 'ORIGIN',
  'Pernambuco · Brasil': 'Pernambuco · Brazil',
  'ESTILO': 'STYLE',
  'Experiência sônica do mundo quântico': 'A sonic experience of the quantum world',
  'Apresentações ao vivo nas maiores raves do Nordeste:': 'Live performances at the biggest raves in Northeast Brazil:',

  // 02 · Música
  '/ SOM': '/ SOUND',
  'Ouça o ATOMUZ nas plataformas oficiais.': 'Listen to ATOMUZ on the official platforms.',
  'ABRIR': 'OPEN',
  'CARREGANDO PLAYER…': 'LOADING PLAYER…',
  'Abrir ATOMUZ no Spotify (abre em nova aba)': 'Open ATOMUZ on Spotify (opens in a new tab)',
  'Abrir ATOMUZ no SoundCloud (abre em nova aba)': 'Open ATOMUZ on SoundCloud (opens in a new tab)',
  'Player do Spotify — ATOMUZ': 'Spotify player — ATOMUZ',
  'Player do SoundCloud — ATOMUZ': 'SoundCloud player — ATOMUZ',

  // 03 · Lançamento
  '/ ÚLTIMO LANÇAMENTO': '/ LATEST RELEASE',
  'LANÇAMENTO': 'RELEASE',
  'Informações do lançamento': 'Release details',
  'Duração:': 'Duration:',
  'Primordial Particle, como o nome já diz, é a Partícula Primordial de muitas outras que estão surgindo. A faixa é desenvolvida através de atmosferas introspectivas, groove imersivo, melodias marcantes e sound design inteligente, levando o ouvinte a um cenário biotecnológico.':
    'Primordial Particle, as the name says, is the Primordial Particle of many others to come. The track unfolds through introspective atmospheres, an immersive groove, striking melodies and clever sound design, taking the listener into a biotechnological landscape.',
  'Capa de Primordial Particle: figura tecnológica inspirada em Kokopelli segurando um átomo luminoso no deserto, sob o logo ATOMUZ, com seres dançando ao redor':
    'Primordial Particle cover: a technological figure inspired by Kokopelli holding a glowing atom in the desert, under the ATOMUZ logo, with beings dancing around',
  'Player do SoundCloud — Primordial Particle': 'SoundCloud player — Primordial Particle',
  'Ouvir Primordial Particle no SoundCloud (abre em nova aba)': 'Listen to Primordial Particle on SoundCloud (opens in a new tab)',
  'Ouvir Primordial Particle no Spotify (abre em nova aba)': 'Listen to Primordial Particle on Spotify (opens in a new tab)',
  'MASTERIZAÇÃO': 'MASTERING',
  'ARTE': 'ARTWORK',
  'SELO': 'LABEL',

  // 04 · Conecte
  '/ REDES': '/ NETWORK',
  'CONECTE': 'CONNECT',
  'ATOMUZ no Instagram (abre em nova aba)': 'ATOMUZ on Instagram (opens in a new tab)',
  'ATOMUZ no Spotify (abre em nova aba)': 'ATOMUZ on Spotify (opens in a new tab)',
  'ATOMUZ no SoundCloud (abre em nova aba)': 'ATOMUZ on SoundCloud (opens in a new tab)',
  'Enviar e-mail para atomuz.audio@gmail.com': 'Send an e-mail to atomuz.audio@gmail.com',

  // 05 · Ao vivo
  '/ APRESENTAÇÕES': '/ PERFORMANCES',
  'PRÓXIMAS DATAS': 'UPCOMING DATES',
  'Nenhuma data anunciada no momento. As novas apresentações são divulgadas primeiro no Instagram.':
    'No dates announced yet. New shows are announced first on Instagram.',
  'ACOMPANHAR': 'FOLLOW',
  'Acompanhar ATOMUZ no Instagram (abre em nova aba)': 'Follow ATOMUZ on Instagram (opens in a new tab)',
  'HORA': 'TIME',
  'LOCAL': 'VENUE',
  'INGRESSOS': 'TICKETS',
  'Instagram da Bifrost Open Air (abre em nova aba)': 'Bifrost Open Air on Instagram (opens in a new tab)',
  'Ingresso sem taxa': 'Ticket with no fee',
  'Venda de ingressos online': 'Online ticket sales',
  'SETS AO VIVO': 'LIVE SETS',
  'OUVIR SET': 'PLAY SET',
  'no SoundCloud (abre em nova aba)': 'on SoundCloud (opens in a new tab)',

  // 06 · Mídia
  'Fotos de apresentações do ATOMUZ — parte 1': 'Photos of ATOMUZ shows — part 1',
  'Fotos de apresentações do ATOMUZ — parte 2': 'Photos of ATOMUZ shows — part 2',
  'Ampliar foto': 'View photo',
  'Fechar': 'Close',
  'Foto anterior': 'Previous photo',
  'Próxima foto': 'Next photo',
  'Público dançando sob tendas iluminadas em vermelho e laranja': 'Crowd dancing under tents lit in red and orange',
  'Pista lotada sob tendas vermelhas iluminadas': 'Packed dance floor under lit red tents',
  'Palco em forma de penas de pavão iluminado em azul e verde': 'Peacock-feather stage lit in blue and green',
  'Palco da Samsara Leave iluminado, com público em primeiro plano': 'Samsara Leave stage lit up, with the crowd in the foreground',
  'Fachada do palco da Samsara Leave com palmeiras e projeções': 'Samsara Leave stage front with palm trees and projections',
  'ATOMUZ no palco da Samsara Leave, sob a decoração colorida do evento': 'ATOMUZ on the Samsara Leave stage, under the festival’s colorful decor',
  'ATOMUZ no palco da Samsara Leave, iluminado em tons quentes': 'ATOMUZ on the Samsara Leave stage, lit in warm tones',
  'ATOMUZ na cabine de som, com painel neon verde ao fundo': 'ATOMUZ in the DJ booth, with a green neon panel behind',
  'ATOMUZ de fone de ouvido, mixando diante de um painel psicodélico': 'ATOMUZ wearing headphones, mixing in front of a psychedelic panel',
  'ATOMUZ de costas na cabine, olhando para a pista colorida': 'ATOMUZ from behind in the booth, facing the colorful dance floor',
  'ATOMUZ de costas com camiseta verde, de frente para a pista': 'ATOMUZ from behind in a green T-shirt, facing the dance floor',
  'ATOMUZ com o braço erguido na cabine, sob decoração psicodélica': 'ATOMUZ with a raised arm in the booth, under psychedelic decor',

  // 07 · Átomo
  '/ IDENTIDADE VISUAL': '/ VISUAL IDENTITY',
  'ÁTOMO': 'ATOM',
  'O átomo é o símbolo central do Atomuz — uma representação visual de':
    'The atom is the central symbol of Atomuz — a visual representation of',
  'matéria, energia, movimento e transformação.': 'matter, energy, motion and transformation.',
  'Mova o cursor ou clique pelo campo: o sistema responde sutilmente, como uma interface científica experimental.':
    'Move the cursor or click across the field: the system responds subtly, like an experimental scientific interface.',
  'Partes do símbolo': 'Parts of the symbol',
  'Reconstruir o átomo': 'Rebuild the atom',
  'NÚCLEO': 'NUCLEUS',
  'Matéria': 'Matter',
  'ÓRBITAS': 'ORBITS',
  'Energia': 'Energy',
  'ELÉTRONS': 'ELECTRONS',
  'Movimento': 'Motion',
  'CAMPO': 'FIELD',
  'Transformação': 'Transformation',
  'Diagrama do átomo do ATOMUZ: núcleo, três órbitas com elétrons e o campo ao redor':
    'ATOMUZ atom diagram: nucleus, three orbits with electrons and the surrounding field',

  // 08 · Booking
  '/ CONTATO': '/ CONTACT',
  'Para bookings, festivais, clubes, eventos e': 'For bookings, festivals, clubs, events and',
  'colaborações.': 'collaborations.',
  'Preencha o formulário com os detalhes do evento. A resposta chega pelo e-mail informado.':
    'Fill in the form with the event details. You will get a reply at the e-mail you provide.',
  '(abre em nova aba)': '(opens in a new tab)',
  'AGÊNCIA': 'AGENCY',
  'REPRESENTADO POR': 'REPRESENTED BY',
  'Start Bookings, agência do ATOMUZ, no Instagram (abre em nova aba)': 'Start Bookings, ATOMUZ’s agency, on Instagram (opens in a new tab)',
  'NOME COMPLETO': 'FULL NAME',
  'NOME DO EVENTO': 'EVENT NAME',
  'DATA': 'DATE',
  'PAÍS': 'COUNTRY',
  'CIDADE': 'CITY',
  'ESTADO': 'STATE',
  'INSTAGRAM / SITE': 'INSTAGRAM / WEBSITE',
  'MENSAGEM': 'MESSAGE',
  'campos obrigatórios': 'required fields',
  'ENVIAR SOLICITAÇÃO': 'SEND REQUEST',
  'ENVIANDO…': 'SENDING…',
  'Solicitação enviada! Obrigado — a resposta chega no e-mail informado.':
    'Request sent! Thank you — you will get a reply at the e-mail you provided.',
  'Não foi possível enviar agora. Tente de novo ou escreva para':
    'Could not send right now. Please try again or write to',

  // Rodapé
  'VOLTAR AO TOPO': 'BACK TO TOP',
};

const META_DESCRIPTION = {
  pt: 'ATOMUZ — site oficial do projeto de música eletrônica. Psytrance, ciência e tecnologia.',
  en: 'ATOMUZ — official website of the electronic music project. Psytrance, science and technology.',
};
const TOGGLE_LABEL = {
  pt: { label: 'Mudar o idioma para inglês', title: 'English' },
  en: { label: 'Switch language to Portuguese', title: 'Português' },
};
const ATTRS = ['aria-label', 'alt', 'title'];
const KEY = 'atomuz:lang';

const norm = (text) => text.replace(/\s+/g, ' ').trim();
let lang = 'pt';
const entries = [];   // { apply(lang) } de cada texto ou atributo traduzível

/** Texto no idioma atual a partir do texto em português. */
export function t(pt) {
  return lang === 'en' ? EN[norm(pt)] ?? pt : pt;
}

export function currentLang() {
  return lang;
}

function collect() {
  // Textos (mantém os espaços em volta: eles separam palavras de <em> etc.)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.parentElement?.closest('script, style, noscript, [data-lang-toggle]')) return NodeFilter.FILTER_REJECT;
      return EN[norm(node.nodeValue)] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const pt = node.nodeValue;
    const [, lead, , trail] = pt.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const en = lead + EN[norm(pt)] + trail;
    const target = node;
    entries.push({ apply: (l) => { target.nodeValue = l === 'en' ? en : pt; } });
  }

  // Atributos de acessibilidade (leitores de tela) e textos alternativos
  const selector = ATTRS.map((a) => `[${a}]`).join(',');
  for (const el of document.body.querySelectorAll(selector)) {
    if (el.closest('[data-lang-toggle]')) continue;
    for (const attr of ATTRS) {
      const pt = el.getAttribute(attr);
      if (!pt || !EN[norm(pt)]) continue;
      const en = EN[norm(pt)];
      entries.push({ apply: (l) => el.setAttribute(attr, l === 'en' ? en : pt) });
    }
  }
}

function apply(next, save) {
  lang = next === 'en' ? 'en' : 'pt';
  for (const entry of entries) entry.apply(lang);

  const root = document.documentElement;
  root.lang = lang === 'en' ? 'en' : 'pt-BR';
  document.querySelector('meta[name="description"]')?.setAttribute('content', META_DESCRIPTION[lang]);
  for (const button of document.querySelectorAll('[data-lang-toggle]')) {
    button.setAttribute('aria-label', TOGGLE_LABEL[lang].label);
    button.setAttribute('title', TOGGLE_LABEL[lang].title);
  }

  if (save) {
    try {
      if (lang === 'en') localStorage.setItem(KEY, 'en');
      else localStorage.removeItem(KEY);
    } catch { /* navegação privada: só não lembra a escolha */ }
  }
  document.dispatchEvent(new CustomEvent('atomuz:langchange', { detail: { lang } }));
}

export function initI18n() {
  collect();
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* sem armazenamento */ }
  apply(saved === 'en' ? 'en' : 'pt', false);

  document.addEventListener('click', (event) => {
    if (!event.target.closest?.('[data-lang-toggle]')) return;
    apply(lang === 'en' ? 'pt' : 'en', true);
  });
}
