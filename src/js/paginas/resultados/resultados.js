import { buscarLivrosPorAssunto } from '../../servicos/api.js'
import { limparEstado, mostrarCarregamento, mostrarErro, criarCapa, criarInformacoes } from '../../componentes/livros.js'

export function renderizarResultados(conteudo, { consulta }) {
  const assunto = (consulta.get('assunto') || '').trim()
  conteudo.innerHTML = `<section class="livros"><h1 class="livros__titulo">Resultados</h1><p class="livros__subtitulo"></p><div class="livros__estado"></div><a class="livros__voltar" href="#/inicio">Nova busca</a></section>`
  const secao = conteudo.querySelector('section')
  const subtitulo = secao.querySelector('.livros__subtitulo')
  const estado = secao.querySelector('.livros__estado')
  let requisicao = 0
  if (!assunto) {
    subtitulo.textContent = 'Informe um assunto para buscar livros.'
    return
  }
  subtitulo.textContent = `Busca por “${assunto}”`

  async function carregar() {
    const atual = ++requisicao
    mostrarCarregamento(estado, 3)
    try {
      const resultado = await buscarLivrosPorAssunto(assunto)
      if (!secao.isConnected || atual !== requisicao) return
      limparEstado(estado)
      if (!resultado.livros.length) {
        const mensagem = document.createElement('p')
        mensagem.className = 'livros__mensagem'
        mensagem.textContent = 'Nenhum livro encontrado para este assunto. Tente outra busca.'
        estado.append(mensagem)
        return
      }
      let ordenados = false
      const ordenar = document.createElement('button')
      ordenar.type = 'button'
      ordenar.className = 'livros__ordenar'
      ordenar.textContent = 'Ordenar por título'
      const lista = document.createElement('ul')
      lista.className = 'livros__lista'
      function atualizarLista() {
        lista.replaceChildren()
        const livros = [...resultado.livros]
        if (ordenados) livros.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
        for (const livro of livros) {
          const item = document.createElement('li')
          item.className = 'livro'
          item.append(criarCapa(livro), criarInformacoes(livro, true))
          lista.append(item)
        }
      }
      ordenar.addEventListener('click', () => {
        ordenados = !ordenados
        ordenar.textContent = ordenados ? 'Usar ordem original' : 'Ordenar por título'
        atualizarLista()
      })
      atualizarLista()
      estado.append(ordenar, lista)
    } catch (erro) {
      if (!secao.isConnected || atual !== requisicao) return
      mostrarErro(estado, erro, carregar)
    }
  }
  carregar()
}
