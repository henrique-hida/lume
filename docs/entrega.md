# Documento, avaliação e entrega

Estes apontamentos não substituem o Google Docs original criado pelo professor.

## Etapas

- **E1 — Esqueleto:** Docs com capa e identificação, pergunta do app, esqueleto rodando com rotas e menu, API testada no Postman e print da resposta no Docs.
- **E2 — Dados reais:** busca, resultados e detalhe vindos da API, com carregando, erro e vazio.
- **E3 — App completo:** cache, recurso nativo, favoritos e documento completo.
- **Apresentação:** 03/12, 10 minutos por grupo, app a 360 px e uma pergunta por integrante. Confirmar o ano e as datas de E1 a E3.
- Grupo de 3 a 4 pessoas; um repositório por grupo na organização do GitHub, com Kanban. As etapas são conferidas na data e o que não estiver no repositório ou no Docs não conta para a etapa.

## Google Docs

O professor cria e compartilha um documento por grupo; o link fica no projeto do grupo na organização do GitHub. Cada integrante escreve logado na própria conta; texto colado por outra pessoa conta para quem colou. Não copiar nem recriar o documento, pois isso perde o histórico.

Usar padrão Fatec: capa, sumário automático, tópicos numerados e referências. Logo após a capa, incluir tabela com conta Google logada, usuário do GitHub e nome e sobrenome no SIGA. Código e JSON são texto em bloco de código, nunca print; prints das telas a 360 px, com legenda. A E1 pede também print da resposta no Postman.

### Estrutura obrigatória

1. Problema e quem usa: pergunta e três situações de uso.
2. Mapa de telas: tabela de rota (`#/...`), tela, o que mostra e origem dos dados.
3. API: endereços, exemplo resumido da resposta em texto, função de conversão para o formato do app e limites (quantas chamadas e o que ocorre na falha).
4. Recurso nativo: qual, por que serve à pergunta e comportamento quando a permissão é negada, quando aplicável.
5. Testes de falha: prints dos quatro estados e como foram provocados.
6. Três decisões e um descartado, como no Desafio 1.
7. Organização da equipe: link do Kanban e tabela integrante → telas, arquivos e seções do documento.
8. Duas dificuldades reais: erro, hipótese inicial e causa real.
9. Uso de IA: onde foi usada, para quê e o que foi alterado na resposta. Usar não tira nota; esconder tira.
10. O que ficou de fora, conclusão e referências, incluindo no mínimo documentação da API e do Capacitor.

## Apresentação e participação

Sem slides; todos falam, com o app rodando a 360 px ou celular espelhado:

1. Pergunta do app: 1 minuto.
2. Buscar, abrir detalhe, salvar favorito e usar recurso nativo: 3 minutos.
3. Modo avião, aviso e cache: 2 minutos.
4. `api.js`, conversão e estados, explicados por quem escreveu: 4 minutos.

Ao fim, o professor pergunta a cada integrante sobre sua parte. A nota do grupo é multiplicada por fator individual: 1,0 se aparece em 2 ou 3 fontes e responde; 0,85 se aparece em 1 e responde; 0,7 se não aparece em nenhuma mas explica; 0,5 se não explica a parte atribuída; 0 se não aparece em nenhuma e falta sem justificativa. Fontes: histórico do Docs, commits e cards concluídos no Kanban. Para contar, respectivamente: escrever sua parte na própria conta; fazer commits com código em pelo menos dois dias diferentes; ou ter card atribuído e concluído.

## Rubrica — 100 pontos

| Parte | Critério | Pontos |
| --- | --- | ---: |
| App | P1 Estrutura e rotas: menu gerado, F5 no detalhe, rota inexistente | 8 |
| App | P2 API isolada em api.js e resposta convertida | 10 |
| App | P3 Quatro estados em toda tela que busca dados | 8 |
| App | P4 Cache sem internet com hora | 6 |
| App | P5 Recurso nativo servindo à pergunta | 8 |
| App | P6 Favoritos guardados no aparelho | 4 |
| App | P7 Flexbox, tokens e 360 px sem rolagem lateral | 6 |
| Documento | D1 Pergunta e situações de uso | 4 |
| Documento | D2 Mapa de telas | 4 |
| Documento | D3 API: endereços, exemplo, conversão e limites | 7 |
| Documento | D4 Testes de falha com prints | 5 |
| Documento | D5 Decisões e descartado | 3 |
| Documento | D6 Organização, identificação e uso de IA | 3 |
| Documento | D7 Padrão Fatec: capa, sumário, tópicos e referências | 4 |
| Apresentação | A1 App ao vivo, incluindo modo avião | 8 |
| Apresentação | A2 Cada um explica o próprio código | 12 |

Cada critério tem faixas: excelente 100%, bom 75%, suficiente 50%, insuficiente 25% ou zero se não existir.

## Penalidades

- Não rodar com `npm install` e `npm run dev` em pasta limpa: avaliação pela leitura do código, com no máximo metade em P1 a P7.
- `fetch` fora de `api.js`: P2 pela metade.
- `display: grid` ou framework CSS: P7 zerado.
- Chave de API no código: P2 zerado.
- Etapa sem entrega na data: o que não estava no repositório no dia não conta para aquela etapa.
- Docs recriado ou copiado, sem histórico: fator de participação de todos calculado sem a fonte Docs.
- Código idêntico ao de outro grupo: parte copiada vale zero para ambos, até conversa com o professor.

## Checklist antes de entregar

- [ ] Todos constam na identificação e escreveram na própria conta.
- [ ] Clone limpo: `npm install`, `npm run dev` e app aberto.
- [ ] Procurar `fetch` no projeto e confirmar chamadas somente em `api.js`.
- [ ] Modo avião mostra aviso e dados guardados.
- [ ] F5 no detalhe e em rota inexistente.
- [ ] Negar a permissão do recurso nativo e confirmar que o app continua funcionando, quando houver permissão a negar.
- [ ] Testar a 360 px sem rolagem lateral.
- [ ] Preencher “Uso de IA”.
- [ ] Cada integrante sabe explicar sua parte sem ler.
