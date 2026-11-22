import { buscarLivroPorId } from '../../servicos/api.js'
import { limparEstado, mostrarCarregamento, mostrarErro, criarCapa } from '../../componentes/livros.js'

export function renderizarDetalhe(conteudo, { caminho }) {
  const id = caminho.slice('/detalhe/'.length)
  conteudo.innerHTML = `<section class="livros"><h1 class="livros__titulo">Detalhe</h1><div class="livros__estado"></div><a class="livros__voltar" href="#/inicio">Voltar ao início</a></section>`
  const secao = conteudo.querySelector('section')
  const estado = secao.querySelector('.livros__estado')
  let requisicao = 0
  async function carregar() {
    const atual = ++requisicao
    mostrarCarregamento(estado)
    try {
      const livro = await buscarLivroPorId(decodeURIComponent(id))
      if (!secao.isConnected || atual !== requisicao) return
      limparEstado(estado)
      secao.querySelector('h1').textContent = livro.titulo
      const bloco = document.createElement('div')
      bloco.className = 'livro'
      const dados = document.createElement('div')
      dados.className = 'livro__informacoes'
      const autor = document.createElement('p')
      autor.className = 'livro__meta'
      autor.textContent = livro.autores.length ? livro.autores.join(', ') : 'Autoria não informada'
      const ano = document.createElement('p')
      ano.className = 'livro__meta'
      ano.textContent = livro.anoPublicacao ? `Primeira publicação: ${livro.anoPublicacao}` : 'Ano não informado'
      dados.append(autor, ano)
      bloco.append(criarCapa(livro), dados)
      const tituloSinopse = document.createElement('h2')
      tituloSinopse.className = 'livros__secao'
      tituloSinopse.textContent = 'Sobre o livro'
      const sinopse = document.createElement('p')
      sinopse.className = 'livros__sinopse'
      sinopse.textContent = livro.sinopse || 'Sinopse não disponível.'
      estado.append(bloco, tituloSinopse, sinopse)
    } catch (erro) {
      if (!secao.isConnected || atual !== requisicao) return
      mostrarErro(estado, erro, carregar)
    }
  }
  carregar()
}
