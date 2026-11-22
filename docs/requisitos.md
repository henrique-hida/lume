# Requisitos do aplicativo

Requisitos da prova. Detalhes ainda não definidos permanecem decisões de implementação.

## Tema escolhido

- **Tema 8:** O que eu leio agora?
- **Pergunta:** “que livros existem sobre o assunto que eu quero?”
- **API sugerida:** Open Library.
- **Recurso nativo sugerido:** Preferences, do Capacitor. Guardar favoritos com Preferences conta como recurso nativo; usá-lo somente para cache não conta. Outro recurso da lista pode ser escolhido se o documento explicar sua relação com a pergunta.

## Estrutura exigida

O esqueleto é o do Desafio 1, substituindo `dadosMockados/` por `servicos/`:

```text
src/
  index.html             # uma página, com #app e menu
  css/
    tokens.css
    base.css
    style.css
  js/
    main.js              # roteador: hashchange e find na lista de rotas
    rotas/
      rotas.js           # lista única de telas
    navbar/
      navbar.js          # menu gerado a partir da lista
    servicos/
      api.js             # único arquivo que faz fetch
      cache.js           # guarda e devolve a última resposta
    paginas/             # uma pasta por tela, com seu CSS
```

## Seis telas

| Tela | Requisito |
| --- | --- |
| Início | Pergunta do app e campo de busca, ou botão que usa recurso nativo. |
| Resultados | Lista vinda da API, com um critério de ordenação ou filtro feito no app. |
| Detalhe | Item escolhido por ID na rota, por exemplo `#/detalhe/42`, inclusive depois de F5. |
| Favoritos | Itens salvos pelo usuário e guardados no aparelho. |
| Sobre | Origem dos dados, link da API e hora da última atualização. |
| Rota inexistente | Recebe endereços inexistentes e oferece saída para o início. |

## Consumo da API

1. **A1:** todo `fetch` fica em `servicos/api.js`; telas não chamam `fetch`.
2. **A2:** usar `async`, `await` e `try/catch` em toda chamada. Converter a resposta em uma função para o formato do app antes de chegar à tela; a tela não conhece os campos da API.
3. **A3:** toda tela que busca dados apresenta carregando, erro com botão “tentar de novo”, vazio e sem internet.
4. **A4:** guardar a última resposta de cada busca; sem internet, mostrar os dados guardados com aviso de horário, por exemplo “dados de 14h32”.
5. **A5:** nenhuma chave de API no código; usar APIs abertas.

Os endpoints, limites e comportamentos reais da Open Library ainda precisam ser pesquisados e testados; não presumir limites nem formatos.

## Layout e execução

- Flexbox, sem `display: grid`; nenhum filho flex com largura ou altura fixa. Cores somente em `tokens.css`.
- Funcionar a 360 px sem rolagem lateral; não usar frameworks CSS nem JavaScript.
- Rodar em celular ou emulador Android pelo Capacitor. **Verificar se gerar APK é obrigatório ou ponto extra**; confirmar com o professor.
- O projeto deve iniciar numa pasta limpa com `npm install` e `npm run dev`.
