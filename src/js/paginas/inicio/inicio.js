import './inicio.css'

export function renderizarInicio(conteudo) {
  conteudo.innerHTML = `
    <section class="inicio">
      <h1 class="inicio__titulo">O que eu leio agora?</h1>
      <p class="inicio__descricao">Descubra livros sobre os assuntos que despertam sua curiosidade. Sua próxima leitura começa com uma pergunta.</p>
      <form class="inicio__formulario" role="search">
        <label class="inicio__rotulo" for="assunto">Sobre o que você quer ler?</label>
        <div class="inicio__campos">
          <input class="inicio__campo" id="assunto" name="assunto" type="search" placeholder="Ex.: astronomia, arte, natureza" required>
          <button class="botao" type="submit">Buscar livros</button>
        </div>
        <p class="inicio__ajuda">Digite um assunto para começar.</p>
      </form>
    </section>`

  conteudo.querySelector('form').addEventListener('submit', (evento) => {
    evento.preventDefault()
    const assunto = conteudo.querySelector('#assunto').value.trim()
    if (assunto) window.location.hash = `#/resultados?assunto=${encodeURIComponent(assunto)}`
  })
}
