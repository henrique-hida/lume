import './favoritos.css'
import { listarFavoritos, removerFavorito } from '../../servicos/favoritos.js'
import {
  limparEstado,
  mostrarCarregamento,
  mostrarErro,
  criarCapa,
  criarInformacoes,
} from '../../componentes/livros.js'

export function renderizarFavoritos(conteudo) {
  conteudo.innerHTML = `
    <section class="livros favoritos">
      <h1 class="livros__titulo">Favoritos</h1>
      <p class="livros__subtitulo">Livros salvos neste aparelho para consultar quando quiser.</p>
      <div class="livros__estado"></div>
      <a class="livros__voltar" href="#/inicio">Voltar ao início</a>
    </section>
  `

  const secao = conteudo.querySelector('section')
  const estado = secao.querySelector('.livros__estado')

  let requisicao = 0

  function exibirLista(favoritos) {
    limparEstado(estado)

    if (!favoritos.length) {
      const caixaVazia = document.createElement('div')
      caixaVazia.className = 'favoritos__vazio'

      const mensagem = document.createElement('p')
      mensagem.className = 'livros__mensagem'
      mensagem.textContent =
        'Você ainda não salvou nenhum livro nos favoritos. Faça uma busca por assunto e salve suas próximas leituras.'

      const linkBuscar = document.createElement('a')
      linkBuscar.className = 'botao'
      linkBuscar.href = '#/inicio'
      linkBuscar.textContent = 'Buscar livros'

      caixaVazia.append(mensagem, linkBuscar)
      estado.append(caixaVazia)
      return
    }

    const contagem = document.createElement('p')
    contagem.className = 'favoritos__contagem'
    contagem.setAttribute('aria-live', 'polite')
    contagem.textContent =
      favoritos.length === 1
        ? '1 livro salvo no aparelho'
        : `${favoritos.length} livros salvos no aparelho`

    const lista = document.createElement('ul')
    lista.className = 'livros__lista'

    for (const livro of favoritos) {
      const item = document.createElement('li')
      item.className = 'livro'

      const informacoes = criarInformacoes(livro, true)

      const acoes = document.createElement('div')
      acoes.className = 'favoritos__acoes-livro'

      const botaoRemover = document.createElement('button')
      botaoRemover.type = 'button'
      botaoRemover.className = 'favoritos__botao-remover'
      botaoRemover.textContent = 'Remover favorito'
      botaoRemover.setAttribute('aria-label', `Remover ${livro.titulo} dos favoritos`)
      botaoRemover.addEventListener('click', async () => {
        botaoRemover.disabled = true
        try {
          await removerFavorito(livro.id)
          if (!secao.isConnected) return
          const atualizados = await listarFavoritos()
          if (!secao.isConnected) return
          exibirLista(atualizados)
        } catch (erro) {
          if (!secao.isConnected) return
          mostrarErro(estado, erro, carregar)
        }
      })

      acoes.append(botaoRemover)
      informacoes.append(acoes)

      item.append(criarCapa(livro), informacoes)
      lista.append(item)
    }

    estado.append(contagem, lista)
  }

  async function carregar() {
    const atual = ++requisicao
    mostrarCarregamento(estado, 2)

    try {
      const favoritos = await listarFavoritos()
      if (!secao.isConnected || atual !== requisicao) return
      exibirLista(favoritos)
    } catch (erro) {
      if (!secao.isConnected || atual !== requisicao) return
      mostrarErro(estado, erro, carregar)
    }
  }

  carregar()
}

export default {
  caminho: '/favoritos',
  titulo: 'Favoritos',
  menu: true,
  renderizar: renderizarFavoritos,
}
