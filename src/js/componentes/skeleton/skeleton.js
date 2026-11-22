import './skeleton.css'
import '../livros.css'

export function criarSkeleton({ quantidade = 1, tipo = 'livro' } = {}) {
  const skeleton = document.createElement('div')
  skeleton.className = 'esqueleto'
  skeleton.setAttribute('aria-hidden', 'true')

  const linhas = `<div class="esqueleto__texto">
    <span class="esqueleto__linha esqueleto__linha--titulo"></span>
    <span class="esqueleto__linha"></span>
    <span class="esqueleto__linha esqueleto__linha--curta"></span>
  </div>`
  const item = tipo === 'texto'
    ? linhas
    : `<div class="esqueleto__item"><span class="esqueleto__capa"></span>${linhas}</div>`
  skeleton.innerHTML = item.repeat(quantidade)
  return skeleton
}

export function renderizarPaginaSkeleton(conteudo, { rota }) {
  conteudo.innerHTML = `<section class="livros"><h1 class="livros__titulo"></h1><div class="livros__estado"></div><a class="livros__voltar" href="#/inicio">Voltar ao início</a></section>`
  conteudo.querySelector('h1').textContent = rota.titulo
  const tipo = rota.caminho === '/sobre' ? 'texto' : 'livro'
  conteudo.querySelector('.livros__estado').append(criarSkeleton({ quantidade: tipo === 'texto' ? 2 : 3, tipo }))
}
