import './nao-encontrada.css'

export function renderizarNaoEncontrada(conteudo) {
  conteudo.innerHTML = `
    <section class="mensagem-pagina">
      <h1 class="mensagem-pagina__titulo">Essa página não está por aqui.</h1>
      <p class="mensagem-pagina__texto">Que tal voltar ao início e descobrir uma nova leitura?</p>
      <a class="botao" href="#/inicio">Voltar ao início</a>
    </section>`
}
