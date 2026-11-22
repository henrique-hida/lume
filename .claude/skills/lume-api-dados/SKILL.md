---
name: lume-api-dados
description: Implementar ou revisar a integração Open Library, conversão de dados, cache offline e favoritos do Lume.
---

# API e dados

Consulte `docs/requisitos.md`. Separe tela e dados e traduza a resposta para nomes internos. Somente `src/js/servicos/api.js` pode usar `fetch`.

## Tradução dos dados

Adapte este exemplo aos campos reais verificados na Open Library. É apenas uma ilustração de formato interno, não um contrato já definido nem uma afirmação sobre a resposta da API:

```js
function converterLivro(registro) {
  return {
    id: registro.id,
    titulo: registro.titulo,
    autores: registro.autores ?? [],
  }
}
```

Defina o contrato de livro com a equipe e implemente a conversão usando os campos reais de cada endpoint testado. Preserve identificadores adequados ao detalhe e escape-os ao montar a rota. Trate campos ausentes e respostas HTTP não bem-sucedidas; não presuma que `fetch` lança erro para todo status HTTP. Toda chamada usa `async`, `await` e `try/catch`; não esconda falhas como se fossem lista vazia.

## Cache e favoritos

- `servicos/cache.js` guarda e recupera a última resposta **de cada busca**, junto com o horário. A tela distingue cache offline, sem cache, erro e resultado vazio, e oferece nova tentativa quando aplicável. Não confunda um cache vazio válido com ausência de cache.
- Preferences do Capacitor usado para guardar favoritos é o recurso nativo sugerido. Combine com a equipe funções para ler, salvar e remover itens; teste persistência no Android. Não apresente favoritos de exemplo como dados reais do usuário.
- Um formato ilustrativo para persistência de uma busca é `{ dados, atualizadoEm }`, associado a uma chave por consulta normalizada. Escolha e documente a serialização e o tratamento de falhas de armazenamento na implementação real.
- Confirme endpoints, limites e comportamento da API em fontes oficiais e por testes. Nunca inclua chaves no código ou afirme que o modo avião foi testado sem executá-lo.
