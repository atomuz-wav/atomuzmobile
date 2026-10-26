# PROJETO: ATOMUZ — IMMERSIVE SCI-FI HERO

> **Referência visual obrigatória:** `assets/referencia-hero.jpg`  
> **Objetivo:** transformar a imagem em uma Hero Section funcional, responsiva e animada, preservando ao máximo sua composição original.  
> **Manifesto atualizado:** `PSYTRANCE • SCIENCE • TECHNOLOGY`

## 1. Objetivo

Desenvolva uma Hero Section extremamente sofisticada, futurista, tecnológica e interativa para o site oficial do projeto de música eletrônica **ATOMUZ**, utilizando a imagem anexada como referência visual principal e obrigatória.

O resultado deve reproduzir com o máximo de fidelidade possível a identidade, a composição, a paleta de cores, a tipografia, os elementos gráficos e o posicionamento dos componentes presentes na referência.

A estética deve remeter a:

- Interfaces HUD de sistemas científicos avançados.
- Tecnologia quântica e física atômica.
- Ficção científica futurista.
- Circuitos eletrônicos e sistemas computacionais.
- Visualização de partículas subatômicas.
- Minimalismo tecnológico premium.
- Interfaces holográficas e sistemas de inteligência artificial.

**Direção artística:** White Futuristic Interface + Electric Neon Green + Atomic Particle System + Scientific HUD.

A experiência deve transmitir a sensação de acessar a interface de um computador quântico ou uma inteligência artificial de uma civilização tecnologicamente avançada.

## 2. Paleta de cores — preservação obrigatória

- Branco puro: `#FFFFFF` — background principal.
- Verde neon: `#00FF00` — brilho energético, partículas e detalhes luminosos.
- Verde tecnológico: `#00CC22` — circuitos, bordas e linhas HUD.
- Verde profundo: `#008C18` — profundidade das letras e sombreamento.
- Preto tecnológico: `#071009` — interior escuro da tipografia central.
- Verde translúcido: `rgba(0, 255, 0, 0.15)` — efeitos holográficos.

O fundo deve ser predominantemente branco, limpo e luminoso. Não utilizar fundos pretos, roxos, azuis ou outras cores que descaracterizem a imagem original. O verde neon deve funcionar como fonte de energia visual, não como preenchimento excessivo. Aplicar glow localizado e moderado.

## 3. Estrutura geral da Hero

A Hero deve ocupar 100% da largura e no mínimo `100vh` da altura da janela.

**Superior — Navigation HUD**
- Logotipo ATOMUZ à esquerda.
- Linha eletrônica horizontal conectando os elementos.
- Pequenos indicadores digitais no centro.
- Redes sociais à direita.

**Central — Atomic Identity System**
- Logotipo ATOMUZ como protagonista absoluto.
- Sistema orbital animado atrás do logotipo.
- Núcleo atômico luminoso.
- Campo de milhares de partículas.
- Circuitos eletrônicos laterais.
- Marcações científicas HUD e retículas.

**Inferior — Access Interface**
- Texto: `PSYTRANCE • SCIENCE • TECHNOLOGY`.
- Ornamentos tecnológicos simétricos.
- Botão central `ENTER →`.
- Linhas finas horizontais nas laterais.

Manter bastante espaço em branco para preservar a elegância da referência.

## 4. Logotipo central — ATOMUZ

O logotipo ATOMUZ deve ocupar a região central horizontal, com dimensão ampla e forte presença visual. Usar preferencialmente o **arquivo original do logotipo**, caso esteja disponível. Caso contrário, criar uma aproximação vetorial da tipografia geométrica e futurista presente na referência; não afirmar que uma aproximação é idêntica ao original.

**Características:**
- Letras maiúsculas, angulares e geométricas.
- Cortes diagonais e segmentos tecnológicos.
- Interior verde-escuro quase preto.
- Contornos com iluminação verde neon.
- Brilho verde sutil ao redor das letras.
- Textura interna com pequenos símbolos binários, números e caracteres digitais em movimento vertical, remetendo ao Matrix.
- Leve efeito de profundidade e material tecnológico.

**Microanimações:**
1. Caracteres digitais descem suavemente dentro das letras.
2. Pulsos de energia percorrem os contornos do logotipo.
3. A intensidade do glow oscila muito discretamente.
4. Pequenos pontos luminosos surgem nas interseções das letras.
5. Ao movimentar o cursor, o logotipo apresenta um parallax 3D extremamente sutil.

A leitura de ATOMUZ deve permanecer perfeitamente clara.

## 5. Sistema orbital atômico animado

Atrás do logotipo principal, criar um sistema visual inspirado no modelo atômico estilizado presente na imagem. Utilizar SVG ou Three.js para representar órbitas elípticas finas que se cruzam em diferentes inclinações.

**Características:**
- Linhas extremamente finas e verde claro translúcido.
- Órbitas elípticas cruzadas.
- Ponto central de energia verde brilhante.
- Eixo vertical científico passando pelo núcleo.
- Movimento orbital contínuo e fluido.

**Animação:**
- As órbitas giram lentamente em diferentes eixos.
- Pequenos elétrons luminosos percorrem suas trajetórias.
- O núcleo pulsa suavemente.
- As órbitas variam discretamente de opacidade.
- Um campo energético sutil se forma ao redor do núcleo.

O sistema deve parecer tridimensional e elegante, mas permanecer atrás das letras. Evitar movimentos rápidos e órbitas grossas.

## 6. Campo de partículas — Quantum Particle Wave

Criar um sistema sofisticado de partículas inspirado diretamente nas ondas pontilhadas presentes na referência. Este é um dos elementos mais importantes da Hero.

A composição deve apresentar milhares de micropartículas verdes distribuídas horizontalmente atrás do logotipo, formando ondas orgânicas tridimensionais.

**Características:**
- Partículas minúsculas e circulares, com opacidade variável.
- Distribuição e densidade não uniformes.
- Ondas senoidais e curvas suaves.
- Profundidade tridimensional.
- Partículas concentradas na região central e dispersas nas extremidades.
- Sensação de nuvem quântica, frequência sonora e campo eletromagnético.

**Movimento:**
1. Oscilação vertical suave.
2. Ondas que se propagam lentamente da esquerda para a direita.
3. Algumas partículas flutuam independentemente.
4. Interação com o cursor provoca deformação sutil.
5. Ao afastar o cursor, retorno suave às posições originais.
6. Pulsos ocasionais de energia atravessam o campo.

Utilizar Three.js com `BufferGeometry` e `Points`, ou Canvas com renderização otimizada. Deve parecer um **campo de energia sonoro-atômico**, não uma animação genérica aleatória. **Não substituir as ondas por uma esfera de partículas.**

## 7. Circuitos eletrônicos laterais

Reproduzir os circuitos impressos visíveis na parte direita da referência. Criar caminhos SVG com linhas verdes finas, percursos horizontais e diagonais de 45 graus, ramificações paralelas, nós circulares e terminais vazados.

**Distribuição:**
- Um agrupamento na lateral direita superior, próximo ao logotipo.
- Outro agrupamento na lateral direita inferior.
- Preservar posições e proporções aproximadas da imagem.
- Não sobrecarregar a lateral esquerda.

**Animações:**
- Pulsos luminosos viajam ao longo dos caminhos.
- Alguns terminais piscam suavemente.
- Animação discreta de desenho inicial.
- Nós respondem sutilmente à proximidade do cursor.

As animações devem lembrar transmissão de dados numa placa eletrônica.

## 8. Molduras HUD e elementos científicos

Reproduzir cuidadosamente os detalhes da referência:

**Lateral esquerda:** linha vertical verde fina; canto superior angular; três barras/indicadores verdes; marcas luminosas discretas.

**Lateral direita:** moldura vertical; canto superior angular; retícula circular de precisão.

**Centro:** eixo vertical pelo sistema orbital; pontos de referência; linhas de medição sutis.

**Decoração:** círculos vazados, cruzamentos geométricos, barras digitais segmentadas e marcadores de interface científica.

Esses elementos devem parecer parte de um sistema funcional de monitoramento atômico. Não adicionar painéis grandes, cartões ou caixas desnecessárias.

## 9. Navegação superior — Futuristic Navbar

- **Esquerda:** logotipo ATOMUZ pequeno, em verde neon.
- **Centro:** linha horizontal fina com mudanças angulares e pequenos indicadores digitais.
- **Direita:** ícones oficiais Spotify, SoundCloud e Instagram, somente em verde, separados por linhas verticais finas.

**Hover:** brilho discreto, pequeno movimento vertical e microanimações nos contornos.

**Links (abrir em nova aba com `rel="noopener noreferrer"`):**
- Spotify: https://open.spotify.com/intl-pt/artist/55wNhCr9PhSkrum4GwGuZi
- SoundCloud: https://soundcloud.com/atomuz
- Instagram: https://www.instagram.com/atomuz_/

## 10. Texto inferior — Brand Manifesto

Posicionar centralizado abaixo do logotipo:

**`PSYTRANCE • SCIENCE • TECHNOLOGY`**

- Fonte geométrica futurista.
- Maiúsculas e espaçamento entre caracteres bastante amplo.
- Verde tecnológico, tamanho moderado, alinhamento central.
- Animação de revelação suave, caractere por caractere.

Abaixo, criar ornamentos horizontais simétricos com linhas finas verdes, segmentos digitais e retícula circular central.

## 11. Botão ENTER — Interface de acesso

**Texto:** `ENTER →`.

**Visual:** fundo branco/transparente, borda verde neon fina, formato retangular com cantos chanfrados, recortes geométricos, tipografia verde e seta para a direita. Linhas horizontais finas nas laterais.

**Hover:** preenchimento verde percorrendo o botão, seta deslocando alguns pixels, contraste legível e bordas acendendo sequencialmente.

**Clique:**
1. O núcleo aumenta brevemente de luminosidade.
2. As órbitas aceleram sutilmente.
3. Uma onda percorre o campo de partículas.
4. A interface desaparece com fade e leve movimento.
5. O usuário vai suavemente para a próxima seção do site.

Duração aproximada de **1 a 1,5 segundo**; respeitar preferência de movimento reduzido. Se a próxima seção ainda não existir, implementar destino funcional de demonstração ou documentar claramente a integração, sem criar navegação quebrada.

## 12. Animação de entrada — Initialization Sequence

1. **System Boot:** fundo branco; pontos verdes surgem; linhas HUD começam a ser desenhadas.
2. **Particle Field:** nuvem se materializa; ondas assumem posição; circuitos aparecem.
3. **Atomic Core:** núcleo acende; órbitas surgem e começam a girar.
4. **ATOMUZ Identity:** logotipo aparece; caracteres digitais percorrem letras; pulso ilumina o texto.
5. **Interface Online:** manifesto, botão ENTER e navegação são revelados.

Sequência sofisticada, fluida e breve, sem atrasar excessivamente o acesso.

## 13. Interatividade com o mouse

- **Próximo ao núcleo:** partículas respondem; iluminação muda suavemente.
- **Sobre o logotipo:** deslocamento discreto em profundidade e reação do brilho.
- **Sobre circuitos:** nós próximos recebem pulso luminoso.
- **Movimento geral:** parallax com diferentes intensidades entre camadas.

Evitar movimentos bruscos ou exagerados.

## 14. Tecnologias

- **HTML5:** estrutura semântica.
- **CSS3:** layout, responsividade e efeitos visuais.
- **JavaScript:** interatividade e controle.
- **Three.js:** partículas 3D e, se necessário, sistema orbital.
- **GSAP:** timelines, inicialização e transições.
- **SVG:** circuitos, retículas, ornamentos e molduras HUD.
- **SVG oficiais ou biblioteca de ícones:** redes sociais e interface.

Priorizar renderização otimizada, evitando milhares de elementos DOM individuais. Organizar componentes e módulos com clareza.

## 15. Responsividade

**Desktop:** composição ampla e cinematográfica; logotipo dominante; órbitas e partículas visíveis; circuitos laterais.

**Tablet:** escala proporcional; simplificação seletiva de circuitos; logotipo e manifesto centrados.

**Mobile:** preservar identidade; logotipo dentro da viewport; menos partículas; simplificar HUD; navegação acessível; reorganizar manifesto e botão; não permitir rolagem horizontal.

Não apenas recortar a versão desktop: adaptar a composição preservando a estética.

## 16. Performance e acessibilidade

- Buscar 60 FPS em dispositivos compatíveis, sem prometer isso em todos.
- Usar `requestAnimationFrame` em animações contínuas.
- Limitar `devicePixelRatio` no WebGL se necessário.
- Ajustar quantidade de partículas conforme capacidade do dispositivo.
- Pausar animações com aba oculta.
- Respeitar `prefers-reduced-motion`.
- Garantir contraste, navegação por teclado, foco visível e rótulos acessíveis.
- Evitar efeitos luminosos intermitentes intensos.
- Criar fallback se WebGL estiver indisponível.

## 17. Restrições importantes

**Não fazer:**
- Alterar a paleta branco, verde e preto.
- Utilizar degradês roxos/azuis ou background escuro.
- Substituir ondas de partículas por animação genérica.
- Utilizar glitch excessivo.
- Mudar o conceito geométrico do logotipo.
- Remover circuitos ou órbitas.
- Adicionar decoração desconexa ou cartões de dashboard.
- Comprometer legibilidade por causa das animações.

**Prioridade absoluta: fidelidade visual à imagem.**

## 18. Entrega final

Desenvolver uma Hero Section funcional e pronta para integração ao site ATOMUZ:

1. `index.html`.
2. `style.css`.
3. `script.js`.
4. Pasta de assets organizada quando necessário.
5. Comentários nas partes mais complexas.
6. Animações e interações implementadas.
7. Design responsivo.
8. Instruções simples para rodar localmente.

Se for conveniente entregar em HTML único, incorporar CSS/JS organizadamente — mas **neste projeto, preferir arquivos separados**.

A Hero deve ser uma **evolução animada da imagem original**, e não uma interpretação visual diferente.

**ATOMUZ — PSYTRANCE • SCIENCE • TECHNOLOGY**

---

## 19. Estratégia de execução recomendada

**Leia todo este briefing antes de começar, mas implemente em etapas. Não avance de fase sem aprovação.**

1. **Layout estático:** composição, tipografia, logotipo, HUD, circuitos, órbitas e partículas estáticas. Comparar visualmente com a imagem.
2. **Partículas e átomo:** animações Three.js ou SVG; validar sobreposição e fluidez.
3. **Circuitos e HUD:** pulsos, indicadores, números digitais e efeitos dentro do logotipo.
4. **Interatividade:** mouse, parallax, hover e transição ENTER.
5. **Refinamento:** responsividade, acessibilidade, performance e revisão final frente à referência.

Ao terminar cada etapa, apresentar arquivos alterados, o que foi implementado, como testar e eventuais limitações. **Esperar autorização antes da etapa seguinte.**
