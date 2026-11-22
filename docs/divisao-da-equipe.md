# Divisão do trabalho — Henrique, Matheus e Enzo

Proposta de divisão para desenvolver o aplicativo e escrever o Google Docs ao mesmo tempo. Cada integrante é responsável por sua parte de ponta a ponta, faz seus próprios commits e escreve suas seções diretamente no documento compartilhado pelo professor.

## Visão geral

| Integrante | Projeto | Google Docs |
| --- | --- | --- |
| Henrique | Base, navegação, layout global, Início e rota inexistente | Capa e identificação; 1. Problema e quem usa; 2. Mapa de telas; 7. Organização da equipe |
| Matheus | Open Library, conversão dos dados, Resultados e Detalhe | 3. API; parte de 5. Testes de falha ligada às telas que consomem a API |
| Enzo | Cache, favoritos, Capacitor e Sobre | 4. Recurso nativo; parte de 5. Testes de falha ligada ao cache e ao modo avião |

As seções 6, 8, 9 e 10 têm contribuições individuais distribuídas abaixo. A divisão é uma proposta de responsabilidade, não um registro de trabalho já realizado.

## Henrique — base e navegação

**Aplicativo**

- Criar a estrutura inicial, os comandos de instalação e execução e o esqueleto das rotas e do menu gerado pela lista única, seguindo os padrões registrados nas skills do projeto.
- Implementar a tela **Início**, incluindo a pergunta e o campo de busca, e a tela de **rota inexistente**, com retorno ao início.
- Cuidar dos estilos globais e tokens, da navegação por hash e da adaptação inicial a 360 px.
- Integrar as telas dos colegas à lista de rotas e conferir F5 no detalhe e na rota inexistente junto com eles.

**Arquivos principais:** `src/index.html`, `src/css/`, `src/js/main.js`, `src/js/rotas/`, `src/js/navbar/`, pastas de Início e rota inexistente em `src/js/paginas/`, além da configuração geral de execução. Henrique é o responsável pelas alterações nesses arquivos compartilhados.

**Documento:** capa, identificação e sumário; seção 1 com a pergunta e três situações de uso; seção 2 com o mapa das seis telas; seção 7 com link do Kanban e atribuições. Na seção 6, registrar uma decisão própria. Na seção 9, relatar seu uso de IA e as alterações feitas. Na seção 10, contribuir com conclusão, itens pendentes e referências pertinentes.

## Matheus — API e descoberta de livros

**Aplicativo**

- Pesquisar e testar os endpoints da Open Library, inclusive no Postman para a E1; registrar endereço, resposta e limites confirmados.
- Implementar `servicos/api.js`, único local das chamadas `fetch`, com `async`, `await`, `try/catch` e funções de conversão para o formato do app.
- Implementar **Resultados**, com filtro ou ordenação no app, e **Detalhe**, consultando o item pelo identificador da rota, inclusive após F5.
- Nas telas que consultam dados, implementar carregando, erro com nova tentativa, vazio e sem internet; conectar o cache e os favoritos pelas interfaces combinadas com Enzo.

**Arquivos principais:** `src/js/servicos/api.js` e pastas de Resultados e Detalhe em `src/js/paginas/`. Pedidos de alteração em rotas, estilos globais ou serviços de Enzo devem ser combinados com os responsáveis.

**Documento:** seção 3 completa, com endpoints, exemplo de JSON como texto, conversão e limites verificados; na seção 5, descrever e ilustrar carregamento, erro e vazio, com os métodos usados para provocá-los. Na seção 6, registrar uma decisão própria; na seção 8, uma dificuldade real; na seção 9, seu uso de IA; e na seção 10, referências da API e pendências de sua parte.

## Enzo — persistência e Android

**Aplicativo**

- Implementar `servicos/cache.js`: guardar e recuperar a última resposta de cada busca e o horário correspondente, para uso nas telas com dados.
- Configurar Capacitor e Preferences; implementar armazenamento, consulta e remoção de **favoritos** no aparelho. Preferences usado para favoritos atende à sugestão de recurso nativo do tema.
- Implementar as telas **Favoritos** e **Sobre**. Sobre deve indicar a origem e o link dos dados e a última atualização disponível.
- Testar a persistência e o funcionamento no Android e, com Matheus, a busca em modo avião, incluindo dados guardados e horário. Confirmar com o professor se o APK é obrigatório.

**Arquivos principais:** `src/js/servicos/cache.js`, um serviço próprio de favoritos a combinar, pastas de Favoritos e Sobre em `src/js/paginas/` e configuração Capacitor/Android. Mudanças em dependências e arquivos de configuração compartilhados devem ser combinadas com Henrique para evitar conflitos.

**Documento:** seção 4 sobre Preferences, relação com a pergunta e comportamento aplicável a permissões; na seção 5, descrever e ilustrar modo avião, cache e horário. Na seção 6, registrar uma decisão própria e um caminho descartado; na seção 8, uma dificuldade real; na seção 9, seu uso de IA; e na seção 10, referências do Capacitor e pendências de sua parte. Se Preferences não solicitar permissão, registrar isso após verificar no ambiente utilizado, sem inventar um teste de negação.

## Acordos para trabalhar em paralelo

1. **Começar juntos:** combinar os nomes das rotas, formato de um livro, identificador usado no detalhe e assinaturas dos serviços antes de ligar os módulos. São contratos de integração a definir em conjunto. Confirmar como a Open Library representa identificadores antes de defini-los.
2. **Cada um trabalha nos próprios arquivos:** Henrique mantém rotas e configuração geral; Matheus, API e telas de resultados/detalhe; Enzo, cache, favoritos, Capacitor e suas telas. Comunicar mudanças de contrato aos demais.
3. **Não esperar a implementação dos colegas:** Matheus e Enzo podem desenvolver suas funções e telas com dados de exemplo temporários locais; Henrique pode usar telas provisórias para testar navegação. Não tratar esses exemplos como entrega final: E2 exige dados reais. Remover ou substituir os exemplos antes da integração.
4. **Integração:** Henrique conecta as telas às rotas; Matheus conecta os serviços de Enzo a Resultados e Detalhe; Enzo integra favoritos e cache. Testar o fluxo completo juntos e corrigir incompatibilidades nos arquivos de cada responsável.
5. **Git e Kanban:** cada pessoa usa sua própria branch e seus próprios commits, abre tarefas atribuídas no Kanban e integra alterações pequenas frequentemente. Combinar quem altera arquivos compartilhados e revisar alterações antes de integrá-las.
6. **Documento em paralelo:** cada um escreve diretamente na própria conta no Google Docs original, nas seções atribuídas. Não recriar o documento nem colar como sua a seção escrita por outro. Fotos e conclusões devem corresponder aos testes efetivamente realizados.

## Marcos e verificação conjunta

- **E1:** Henrique entrega esqueleto, rotas, menu e seções iniciais; Matheus testa a API no Postman e registra o print; Enzo inicia Capacitor/favoritos e sua seção. A equipe confere o que precisa estar no repositório e no Docs até a data definida pelo professor.
- **E2:** Matheus entrega busca, resultados, detalhe e estados com dados reais; Henrique integra as rotas e ajuda a validar 360 px; Enzo fornece o cache e combina a integração.
- **E3:** Enzo conclui favoritos, recurso nativo e modo avião; Matheus e Henrique integram e verificam os fluxos; cada um conclui suas seções do documento. As datas de E1 a E3 precisam ser confirmadas.
- **Antes da apresentação:** juntos, testar instalação limpa, 360 px, F5, estados, cache offline, favoritos e execução no Android; conferir a rubrica e o checklist em `docs/entrega.md`. Cada integrante prepara a explicação do próprio código e documento.

Para a participação individual, cada um deve aparecer nas fontes exigidas: escrever sua parte no Docs com a própria conta, fazer commits com código em pelo menos dois dias diferentes e manter cards atribuídos e concluídos. Conforme a rubrica, aparecer em duas ou três fontes **e** responder à pergunta sobre a própria parte corresponde ao fator 1,0.
