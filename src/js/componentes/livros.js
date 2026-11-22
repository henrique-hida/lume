import './livros.css'
import { criarSkeleton } from './skeleton/skeleton.js'

export function criarCapa(livro) {
  const alternativa = document.createElement('span')
  alternativa.className = 'livro__capa livro__sem-capa'
  alternativa.textContent = 'Capa indisponível'
  if (!livro.capaUrl) return alternativa

  const imagem = document.createElement('img')
  imagem.className = 'livro__capa'
  imagem.src = livro.capaUrl
  imagem.alt = `Capa de ${livro.titulo}`
  imagem.loading = 'lazy'
  imagem.addEventListener('error', () => imagem.replaceWith(alternativa), { once: true })
  return imagem
}

export function criarInformacoes(livro, comLink = false) {
  const informacoes = document.createElement('div')
  informacoes.className = 'livro__informacoes'
  const titulo = document.createElement('h2')
  titulo.className = 'livro__titulo'
  if (comLink) {
    const link = document.createElement('a')
    link.className = 'livro__link'
    link.href = `#/detalhe/${encodeURIComponent(livro.id)}`
    link.textContent = livro.titulo
    titulo.append(link)
  } else {
    titulo.textContent = livro.titulo
  }
  const autores = document.createElement('p')
  autores.className = 'livro__meta'
  autores.textContent = livro.autores.length ? livro.autores.join(', ') : 'Autoria não informada'
  const ano = document.createElement('p')
  ano.className = 'livro__meta'
  ano.textContent = livro.anoPublicacao ? `Primeira publicação: ${livro.anoPublicacao}` : 'Ano não informado'
  informacoes.append(titulo, autores, ano)
  return informacoes
}

export function mostrarCarregamento(area, quantidade = 1) {
  area.setAttribute('role', 'status')
  area.setAttribute('aria-label', 'Carregando livros')
  area.replaceChildren(criarSkeleton({ quantidade }))
}

export function limparEstado(area) {
  area.removeAttribute('role')
  area.removeAttribute('aria-label')
  area.replaceChildren()
}

export function mostrarErro(area, erro, tentarNovamente) {
  limparEstado(area)
  const mensagem = document.createElement('p')
  mensagem.className = 'livros__mensagem'
  mensagem.setAttribute('role', 'alert')
  mensagem.textContent = erro.semInternet
    ? 'Sem conexão com a internet. Verifique sua conexão e tente novamente.'
    : erro.message || 'Não foi possível carregar os dados. Tente novamente.'
  const botao = document.createElement('button')
  botao.className = 'botao'
  botao.type = 'button'
  botao.textContent = 'Tentar de novo'
  botao.addEventListener('click', tentarNovamente)
  const acoes = document.createElement('div')
  acoes.className = 'livros__acoes'
  acoes.append(botao)
  area.append(mensagem, acoes)
}
