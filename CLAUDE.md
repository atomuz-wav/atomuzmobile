# ATOMUZ — Instruções permanentes para Claude Code

## Contexto do projeto

Este repositório contém o site oficial do projeto musical **ATOMUZ**, com estética de psytrance, ciência, tecnologia, ficção científica e astronomia.

A primeira entrega é a **Hero Section**, com fidelidade máxima à imagem `assets/referencia-hero.jpg` e ao documento `BRIEFING.md`.

O manifesto oficial atual é **PSYTRANCE • SCIENCE • TECHNOLOGY**.

## Fonte de verdade e prioridades

1. A imagem `assets/referencia-hero.jpg` orienta composição visual, proporções, posicionamento e detalhes.
2. O documento `BRIEFING.md` especifica os requisitos completos e o fluxo de execução.
3. Estas instruções `CLAUDE.md` governam a maneira de desenvolver e validar o projeto.
4. Quando houver conflito significativo entre referência, briefing e implementação, sinalize a diferença e proponha solução antes de mudar a identidade visual.

## Regras visuais inegociáveis

- Paleta principal: branco `#FFFFFF`, verde neon `#00FF00`, verde tecnológico `#00CC22`, verde profundo `#008C18` e preto `#071009`.
- O site abre no **tema escuro** (decisão do usuário, 24/10/2026); o tema claro (fundo branco, fiel à referência) é **opcional**, ativado pelo visitante no botão sol/lua da navbar. Os dois temas devem continuar funcionando e legíveis.
- Preservar logo ATOMUZ, ondas de partículas horizontais, órbitas atômicas, núcleo, circuitos à direita, molduras HUD, navbar, manifesto e botão ENTER.
- Priorizar os espaços negativos e a composição da imagem original.
- Evitar degradês roxos, azuis, cartões de dashboard, elementos decorativos excessivos e glitch forte.
- Se houver logo original disponível nos assets, usá-lo em vez de recriar por fonte genérica. Não alegar reprodução exata sem o arquivo original.

## Stack técnica

- HTML5 semântico, CSS3 e JavaScript moderno.
- Preferir `index.html`, `style.css` e `script.js` separados.
- SVG para molduras, linhas, nós, circuitos e retículas.
- Three.js para partículas e recursos WebGL quando justificável.
- GSAP para sequenciamento e animações coordenadas.
- Evitar dependências desnecessárias e efeitos caros no DOM.
- Manter código modular, legível e com comentários nos trechos difíceis.

## Fluxo de trabalho obrigatório

**Não tente entregar todos os efeitos em uma única rodada.**

1. Ler `BRIEFING.md` e analisar `assets/referencia-hero.jpg`.
2. Implementar **primeiro apenas o layout estático**, com precisão visual.
3. Descrever o resultado e orientar a validação local.
4. **Aguardar aprovação do usuário antes de avançar** para órbitas e partículas animadas, circuitos/HUD animados, interatividade e refinamento final.
5. Em cada etapa, manter tudo que já foi aprovado. Evitar refatorações visuais amplas sem necessidade.
6. Informar quais arquivos foram criados ou modificados e como testar.

## Requisitos de qualidade

- O site deve funcionar em desktop e mobile, sem rolagem horizontal indesejada.
- Respeitar `prefers-reduced-motion` e incluir suporte a teclado e foco visível.
- Otimizar efeitos com `requestAnimationFrame`, pausa em aba oculta e controle de densidade de partículas.
- Usar links oficiais de redes sociais, com `target="_blank"` e `rel="noopener noreferrer"`.
- Não inserir links fictícios, dados inventados ou funcionalidades que pareçam prontas mas não funcionem.
- Se uma biblioteca, imagem ou fonte não estiver disponível, explicar a limitação e propor uma alternativa fiel.

## Links oficiais

- Instagram: https://www.instagram.com/atomuz_/
- SoundCloud: https://soundcloud.com/atomuz
- Spotify: https://open.spotify.com/intl-pt/artist/55wNhCr9PhSkrum4GwGuZi

## Forma de comunicação

- Responder em **português brasileiro**.
- Explicar decisões técnicas de forma objetiva, adequada a alguém que está aprendendo desenvolvimento web.
- No fim de cada etapa, apresentar um resumo do que foi feito, o que falta e como verificar o resultado.
- Não avançar à próxima etapa sem instrução explícita do usuário.
