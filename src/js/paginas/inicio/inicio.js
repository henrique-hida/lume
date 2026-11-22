import './inicio.css'

export function renderizarInicio(conteudo) {
  conteudo.innerHTML = `
    <section class="inicio">
      <h1 class="inicio__titulo">O que eu leio agora?</h1>
      <p class="inicio__descricao">Um assunto. Muitas próximas leituras.</p>
      <svg class="inicio__ilustracao" viewBox="0 0 312 132" aria-hidden="true" focusable="false">
        <circle class="inicio__sol" cx="156" cy="66" r="60" />
        <path class="inicio__livro-sombra" d="M55 101c38-10 72-5 101 8 29-13 63-18 101-8v10c-37-7-71-2-101 12-30-14-64-19-101-12z" />
        <path class="inicio__livro" d="M55 34c39-8 72-2 101 17 29-19 62-25 101-17v67c-38-10-72-5-101 8-29-13-63-18-101-8z" />
        <path class="inicio__traco" d="M156 51v58M71 50c24-3 47 1 68 10M71 63c24-3 47 1 68 10M71 76c24-3 47 1 68 10M173 60c21-9 44-13 68-10M173 73c21-9 44-13 68-10M173 86c21-9 44-13 68-10" />
        <path class="inicio__brilho" d="M257 17v15m-7-7h14M39 43v11m-5-5h10" />
      </svg>
      <form class="inicio__formulario" role="search">
        <label class="inicio__rotulo" for="assunto">Sobre o que você quer ler?</label>
        <div class="inicio__campos">
          <input class="inicio__campo" id="assunto" name="assunto" type="search" placeholder="Ex.: astronomia, arte, natureza" required>
          <button class="botao inicio__botao" type="submit">Buscar livros <span aria-hidden="true">→</span></button>
        </div>
      </form>
    </section>`

  conteudo.querySelector('form').addEventListener('submit', (evento) => {
    evento.preventDefault()
    const assunto = conteudo.querySelector('#assunto').value.trim()
    if (assunto) window.location.hash = `#/resultados?assunto=${encodeURIComponent(assunto)}`
  })
}
