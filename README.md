# ATOMUZ — Hero Section

Site oficial do **ATOMUZ** (psytrance • science • technology). A Hero foi construída a partir da imagem de referência `assets/referencia-hero.jpeg` e do `BRIEFING.md`; as seções seguintes usam o `atomuzVfinal.html` como referência de conteúdo, na identidade visual da Hero.

**Ordem da página:** Hero → 01 MUSIC → 02 RELEASE → 03 LIVE → 04 PROJECT → 05 ATOM → 06 MEDIA → 07 BOOKING → 08 CONNECT → rodapé.

HTML, CSS e JavaScript puros, sem etapa de build. Three.js (partículas) e GSAP (sequências) vêm de CDN e são **opcionais**: se não carregarem, a página continua completa.

---

## Como rodar localmente

O JavaScript usa módulos ES, que **não funcionam abrindo o arquivo com duplo clique** (`file://`). É preciso um servidor local. Use o `serve.py` do projeto, que desliga o cache (toda alteração aparece ao recarregar):

```bash
cd /caminho/para/Atomuz
python3 serve.py
```

Depois abra **http://localhost:5500** no navegador.

> Qualquer servidor estático serve (ex.: `python3 -m http.server 5500`, *Live Server* do VS Code). Sem o `serve.py`, use **Cmd + Shift + R** após alterações, para o navegador não usar arquivos antigos do cache.

### Testar no celular

1. Celular e computador conectados no **mesmo Wi-Fi**.
2. No computador, rode o servidor no modo rede:
   ```bash
   python3 serve.py --rede
   ```
3. O terminal mostra o endereço para o celular, por exemplo `http://192.168.15.5:5500`. Digite-o no navegador do celular.

Se o macOS perguntar se o Python pode aceitar conexões de entrada, clique em **Permitir**. O IP pode mudar quando você troca de rede; o terminal sempre mostra o atual.

---

## Estrutura

```
serve.py                   Servidor local sem cache (desenvolvimento)
tools/versionar.py         Carimba CSS/JS com ?v= no index.html (fura o cache)
index.html                 Estrutura da Hero (HTML semântico + SVG em camadas)
css/style.css              Paleta, escala, layout, hover e responsividade
js/
  script.js                Ponto de entrada: liga os sistemas e os fallbacks
  config.js                Constantes (coordenadas de design, cores)
  core/
    loop.js                Loop único de animação (pausa sozinho)
    motion.js              Preferência "movimento reduzido"
    interaction.js         Cursor em coordenadas da referência, com suavização
    state.js               Estado compartilhado (entrada e transição do ENTER)
  modules/
    particle-field.js      Gera o campo de partículas (+ fallback Canvas 2D)
    particle-webgl.js      Partículas em Three.js (shader comentado)
    atom-system.js         Órbitas, elétrons e núcleo
    logo-matrix.js         Chuva de caracteres dentro das letras
    logo-energy.js         Pulsos no contorno, brilho, faíscas, faixa de luz
    circuit-system.js      Desenho, pulsos de dados e terminais dos circuitos
    hud-system.js          Indicadores, segmentos e retículas
    depth-layers.js        Parallax por camadas
    intro-sequence.js      Sequência de entrada (GSAP)
    enter-transition.js    Transição do botão ENTER (GSAP)
    section-reveal.js      Revelação suave das seções ao rolar
    atom-diagram.js        Seção ATOM: elétrons, parallax e partículas (cursor/clique)
    booking-form.js        Envio do formulário de booking (FormSubmit)
  utils/                   Aleatório com semente, ajudantes de SVG
assets/referencia-hero.jpeg  Imagem de referência (não é usada na página)
```

---

## Onde ajustar

| O quê | Onde |
|---|---|
| Cores da identidade | variáveis no topo de `css/style.css` (`--c-neon`, `--c-tech`…) e `PALETTE` em `js/config.js` |
| Tema escuro (opcional) | tokens `--c-bg`, `--c-fg`, `--c-surface`… em `:root[data-theme="dark"]` (`css/style.css`); lógica no script embutido no `<head>` do `index.html` |
| Logotipo | atributo `d` de `#wm-path` em `index.html` (troque pelo SVG oficial quando existir) |
| Manifesto | `<p class="manifesto">` em `index.html` |
| Links das redes | `nav__social` em `index.html` |
| Ritmo das órbitas | `ORBIT_MOTION` em `js/modules/atom-system.js` |
| Formato das ondas de partículas | `RIBBONS` em `js/modules/particle-field.js` |
| Tempos da entrada | linha do tempo em `js/modules/intro-sequence.js` |
| Destino do ENTER | `href` do botão (hoje `#explorar`, seção provisória) |

**Sistema de escala:** `--u` = 1 pixel da imagem de referência (2048 px). Por isso as coordenadas do SVG e do CSS batem com as medidas da imagem.

---

## Comportamento em camadas (fallbacks)

| Situação | Resultado |
|---|---|
| Tudo carregado | Entrada animada, partículas WebGL, interação com o cursor |
| Sem GSAP (CDN fora) | Sem sequência de entrada; ENTER vira link comum |
| Sem WebGL / Three.js | Partículas estáticas em Canvas 2D; resto animado |
| Movimento reduzido no sistema ou botão "Pausar animações" | Quadro estático idêntico à referência |
| Sem JavaScript | Hero completa e estática (HTML/SVG) |

---

## Tema claro / escuro

O site abre **no tema escuro** (decisão do artista). O botão sol/lua na navbar ativa o tema claro; essa escolha fica salva no navegador e é aplicada antes da página aparecer.

---

## Acessibilidade

- `<h1>`, `<main>` e navegação de redes sociais com rótulos.
- Atalho **"Pular introdução"** (primeiro Tab da página).
- Botão **"Pausar animações"** (aparece ao receber foco pelo teclado; a escolha é lembrada).
- Respeita `prefers-reduced-motion`, `prefers-contrast: more` e modo de alto contraste do Windows.
- Foco visível em todos os controles; hover só em dispositivos com mouse.

---

## Limitações conhecidas

- O logotipo é uma **aproximação vetorial** da referência, não o arquivo original.
- O verde da identidade (`#00CC22`) sobre branco tem contraste de **2,2:1**, abaixo do mínimo WCAG para texto (4,5:1). **Decisão do projeto:** manter o verde da identidade; usuários que pedem mais contraste no sistema (`prefers-contrast: more`) recebem `#007A14` (5,5:1).
- A seção `#explorar` é um espaço reservado até as próximas seções existirem.
- Testado no Chromium (navegador interno do Claude); Safari e Firefox reais ainda precisam de verificação manual.

---

## Fotos da seção MEDIA

- O site usa só as versões otimizadas `assets/media/media-XX.jpg` (1600 px) e `media-XX-sm.jpg` (800 px), **sem metadados** (GPS, câmera, data foram removidos).
- A pasta `assets/media/originais/` guarda os arquivos originais (~250 MB, um deles com localização GPS). **Não publique essa pasta** junto com o site.
- Para trocar ou acrescentar fotos: coloque a original em `originais/`, gere as duas versões otimizadas e acrescente o `<li class="media-item">` na fileira desejada da seção `#media` (`index.html`) **duas vezes**: uma no grupo original e outra no grupo de cópias (`media-item--clone`, com `aria-hidden="true"` e `alt` vazio) — a cópia é o que deixa o loop sem emenda.

---

## Formulário de BOOKING

- Envia pelo [FormSubmit](https://formsubmit.co) para **atomuz.audio@gmail.com** (o destino está no `action` do formulário, em `index.html`).
- **Ativação (uma vez):** envie uma solicitação de teste pelo site e clique em *Activate Form* no e-mail que o FormSubmit mandar. Antes disso, nada é entregue.
- Depois de ativado, dá para trocar o e-mail no `action` pelo código aleatório que o FormSubmit fornece (protege o endereço contra robôs).


---

## Publicar no GitHub Pages (primeira vez)

1. Crie uma conta em [github.com](https://github.com) (se ainda não tiver).
2. Instale o [GitHub Desktop](https://desktop.github.com) e faça login com a conta.
3. No GitHub Desktop: **File → Add Local Repository…** e escolha esta pasta.
4. Clique em **Publish repository**. Desmarque *Keep this code private* (o GitHub Pages gratuito exige repositório público) e confirme.
5. No site do GitHub, abra o repositório → **Settings → Pages** → em *Build and deployment*, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** → **Save**.
6. Em 1–2 minutos o site fica no ar em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/` (o endereço aparece na mesma tela).
7. Abra o site publicado, envie uma solicitação de teste no BOOKING e confirme o e-mail do FormSubmit (*Activate Form*).

> A pasta `assets/media/originais/` está no `.gitignore` e **não** é enviada.

## Fazer alterações depois

1. Abra esta pasta no Claude Code e peça a alteração (uma por vez, como fizemos).
2. Rode `python3 tools/versionar.py` (atualiza os carimbos `?v=` dos arquivos alterados, para nenhum navegador — Safari incluído — usar cópia antiga).
3. Teste localmente: `python3 serve.py` → http://localhost:5500.
4. No GitHub Desktop: escreva um resumo em *Summary* → **Commit to main** → **Push origin**.
5. O GitHub Pages atualiza o site sozinho em 1–2 minutos.

Cada commit é uma versão salva: no GitHub Desktop, em **History**, dá para ver e desfazer qualquer alteração.
