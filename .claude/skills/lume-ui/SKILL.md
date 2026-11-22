---
name: lume-ui
description: Definir, implementar ou revisar a identidade visual, os componentes e a experiência de uso do aplicativo Lume.
---

# UI e experiência do Lume

Use esta skill em telas e componentes do Lume. Consulte também `lume-css` para organização do CSS e `lume-prova` para as exigências da avaliação. A identidade abaixo é uma proposta inicial do projeto, ajustável conforme decisões da equipe; não é exigência do enunciado.

## Direção visual

Crie uma experiência de descoberta de livros acolhedora, calma e legível, com aparência editorial contemporânea. Dê destaque aos títulos e às capas, mantenha a navegação simples e evite excesso de cartões, sombras e elementos decorativos. Priorize uma coluna em telas pequenas e adapte o espaço disponível com Flexbox.

## Layout mobile

- Projete todas as telas para uso em celular, com uma coluna de conteúdo centralizada de até 360 px; em telas menores, ocupe a largura disponível sem rolagem horizontal. Preserve as margens internas e a cor de fundo também nas áreas externas ao conteúdo.
- A navbar fica fora desse limite e pode ocupar a largura da janela. Centralize somente o bloco de conteúdo; mantenha o texto e as ações alinhados de acordo com a hierarquia de cada tela.
- Use tipografia, espaçamentos, controles e skeletons dimensionados para a área mobile mesmo quando a janela for maior. Não faça títulos ou espaçamentos crescerem com o `vw` da janela; use valores em `rem` ou medidas relacionadas ao contêiner quando apropriado.
- Confira em 360 px e em uma janela larga que o conteúdo continue com as mesmas proporções e que a navbar fique independente. Confira também larguras menores sem rolagem horizontal.

## Tokens iniciais

Defina as cores somente em `src/css/tokens.css`, com nomes semânticos, e use variáveis nas telas. Use esta paleta como ponto de partida:

- Fundo: `#F7F5EF`; superfície: `#FFFFFF`; superfície suave: `#EFEEE6`.
- Texto principal: `#202B25`; texto secundário: `#526158`; borda: `#C8D0C8`.
- Ação principal: `#285C42`; texto sobre ação: `#FFFFFF`; ação em hover: `#1E4933`.
- Destaque quente: `#E8BD65`; texto sobre destaque: `#202B25`.
- Erro: `#A52A2A`; sucesso: `#285C42`; foco: `#174F9B`.

Use fundo claro, verde como cor principal e amarelo pontualmente. Verifique contraste das combinações em uso: pelo menos 4,5:1 para texto normal e 3:1 para texto grande e indicadores de interface. Ajuste tokens se necessário; não dependa apenas de cor para comunicar estados.

Centralize também espaçamentos e raios reutilizáveis em tokens: escala de `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem` e `2rem`; raios de `0.375rem` para elementos pequenos, `0.75rem` para campos e botões e `1rem` para superfícies. Reserve formatos totalmente arredondados para pequenos indicadores quando fizer sentido. Use bordas discretas e sombras suaves apenas para indicar separação ou elevação.

## Tipografia e componentes

- Não use eyebrow: texto curto ou rótulo decorativo acima do título. Inicie a hierarquia pelo título da tela.
- Use skeletons que antecipem o formato do conteúdo durante carregamento ou em áreas provisórias sem conteúdo real. Não exiba avisos de desenvolvimento ou prévia na interface; em carregamento real, informe o estado de forma acessível. Substitua skeletons por conteúdo, vazio ou erro quando a operação terminar; não use carregamento infinito. Respeite movimento reduzido.

- Use fonte de sistema, sem depender de carregamento remoto. Títulos com peso forte e corpo confortável; texto base próximo de `1rem` e entrelinha de pelo menos `1.5` para leitura contínua.
- Use hierarquia clara: um título principal por tela, textos de apoio curtos e ações fáceis de localizar. Evite truncar informações essenciais.
- Use elementos HTML semânticos: links para navegação, botões para ações e campos com rótulos visíveis. Forneça foco visível, nomes acessíveis e alvos de toque de aproximadamente 44 px ou mais sem impor dimensões fixas a filhos flex.
- Botões primários usam a cor de ação; secundários têm menor destaque. Campos têm borda, indicação de foco e mensagem de erro próxima. Mantenha estados desabilitado, ativo e carregando claros quando aplicáveis.
- Resultados devem facilitar a leitura de capa, título e autor. Trate capa ausente com alternativa textual útil. Favoritos precisam de estado selecionado perceptível e nome acessível que descreva a ação.
- Apresente carregamento, erro com nova tentativa, vazio e ausência de conexão de forma compreensível. Ao exibir cache offline, mostre o horário conforme os requisitos. Não invente resultados, horários ou funcionalidades.

## Código e verificação

- Use HTML, CSS e JavaScript simples, sem frameworks; preserve a estrutura exigida e a lista única de rotas. Use classes BEM, estilos específicos junto de cada tela e componentes compartilhados somente quando houver reutilização real.
- Mantenha nomes descritivos em português, funções pequenas e responsabilidades claras; evite abstrações prematuras e duplicação de estilos. Não coloque dados ou regras de API nas telas.
- Use Flexbox, sem `display: grid` e sem largura ou altura fixa em filhos flex. Prefira `gap`, `min-width: 0`, medidas flexíveis e limites responsivos compatíveis com essa restrição.
- Verifique a tela e suas interações no navegador a 360 px, incluindo foco por teclado, legibilidade e ausência de rolagem horizontal. Para entrega, valide também no Android por Capacitor. Registre limitações reais de teste, sem tratar inspeção de código como prova visual.
