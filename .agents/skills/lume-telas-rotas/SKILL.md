---
name: lume-telas-rotas
description: Implementar telas, componentes ou navegação por hash no Lume seguindo os padrões do projeto e os requisitos da prova.
---

# Telas e navegação

Consulte `docs/requisitos.md`. Use módulos ES, uma pasta por tela com JS e CSS próximos, componentes que devolvem HTML e uma lista de rotas compartilhada pelo roteador e pela navbar.

## Formato de tela

Cada tela pode exportar um objeto com URL, rótulo, ícone e função de renderização; o menu usa apenas telas com rótulo. Exemplo ilustrativo, com nomes a ajustar ao contrato do projeto:

```js
import './inicio.css'

function inicio(app) {
  app.innerHTML = `
    <section class="tela inicio">
      <h1>Que livros existem sobre o assunto que eu quero?</h1>
      <form id="form-busca" role="search">
        <label for="assunto">Assunto</label>
        <input id="assunto" type="search" required>
        <button type="submit">Buscar</button>
      </form>
    </section>`

  app.querySelector('#form-busca').addEventListener('submit', evento => {
    evento.preventDefault()
    const assunto = app.querySelector('#assunto').value.trim()
    if (!assunto) return
    window.location.hash = `#/resultados?assunto=${encodeURIComponent(assunto)}`
  })
}

export default { url: '#/inicio', label: 'Início', icon: 'search', pagina: inicio }
```

O hash do exemplo é uma sugestão. Combine as rotas e interfaces com a equipe; para detalhe, o enunciado exige identificador no caminho, como `#/detalhe/42`, inclusive após F5. O roteador deve reconhecer segmentos dinâmicos, com `hashchange` e `find` na lista única. Rota desconhecida abre a tela correspondente; a navbar é gerada da mesma lista.

## Telas assíncronas

- Mostre carregamento imediatamente e obtenha dados pelo serviço, nunca por `fetch` na tela. Trate erro com nova tentativa, vazio e sem internet; quando houver cache, mostre dados e horário.
- Antes de atualizar a tela após `await` ou erro, confira se o usuário ainda está na rota da requisição. Considere também requisições concorrentes na mesma rota para não exibir resultado antigo.
- Use eventos após renderizar; navegue mudando o hash. Escape texto externo antes de interpolar HTML ou use `textContent` e APIs do DOM. Não coloque funções ou componentes fictícios nos arquivos finais.
- Verifique menu, rota inexistente, detalhe com F5 e layout a 360 px no app executando.
