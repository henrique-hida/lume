import './resultados.css'
import { buscarLivrosPorAssunto, TIPOS_ERRO_API } from '../../servicos/api.js'
import {
  limparEstado,
  mostrarCarregamento,
  mostrarErro,
  criarCapa,
  criarInformacoes,
} from '../../componentes/livros.js'

let servicoCache = null
let servicoFavoritos = null

export function configurarPersistenciaResultados({ cache, favoritos } = {}) {
  if (cache) servicoCache = cache
  if (favoritos) servicoFavoritos = favoritos
}

export function extrairAssuntoDoHash(hash = window.location.hash) {
  if (typeof hash !== 'string') return ''
  const indice = hash.indexOf('?')
  if (indice === -1) return ''
  const params = new URLSearchParams(hash.slice(indice + 1))
  return (params.get('assunto') ?? params.get('q') ?? '').trim()
}

function normalizarChaveAssunto(assunto) {
  return String(assunto ?? '').trim().toLowerCase()
}

export function filtrarEOrdenarLivros(
  livros,
  { termoFiltro = '', criterioOrdenacao = 'relevancia', somenteComCapa = false } = {},
) {
  const termo = termoFiltro.trim().toLowerCase()

  const filtrados = livros.filter((livro) => {
    if (somenteComCapa && !livro.capaUrl) return false
    if (!termo) return true
    const tituloMatch = livro.titulo.toLowerCase().includes(termo)
    const autorMatch = livro.autores.some((autor) =>
      autor.toLowerCase().includes(termo),
    )
    return tituloMatch || autorMatch
  })

  const lista = [...filtrados]
  if (criterioOrdenacao === 'titulo-az') {
    lista.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
  } else if (criterioOrdenacao === 'ano-recente') {
    lista.sort(
      (a, b) => (b.anoPublicacao ?? -Infinity) - (a.anoPublicacao ?? -Infinity),
    )
  } else if (criterioOrdenacao === 'ano-antigo') {
    lista.sort(
      (a, b) => (a.anoPublicacao ?? Infinity) - (b.anoPublicacao ?? Infinity),
    )
  } else if (criterioOrdenacao === 'edicoes') {
    lista.sort((a, b) => (b.numeroEdicoes ?? 0) - (a.numeroEdicoes ?? 0))
  }

  return lista
}

export function renderizarResultados(conteudo, contexto = {}) {
  const consulta = contexto.consulta
  const assunto = (
    (consulta && typeof consulta.get === 'function' ? consulta.get('assunto') : '') ||
    extrairAssuntoDoHash()
  ).trim()

  conteudo.innerHTML = `
    <section class="livros">
      <h1 class="livros__titulo">Resultados</h1>
      <p class="livros__subtitulo"></p>
      <div class="livros__estado"></div>
      <a class="livros__voltar" href="#/inicio">Nova busca</a>
    </section>
  `

  const secao = conteudo.querySelector('section')
  const subtitulo = secao.querySelector('.livros__subtitulo')
  const estado = secao.querySelector('.livros__estado')

  if (!assunto) {
    subtitulo.textContent = 'Informe um assunto para buscar livros.'
    return
  }

  subtitulo.textContent = `Busca por “${assunto}”`

  let requisicao = 0
  let idsFavoritos = new Set()
  const filtros = {
    termoFiltro: '',
    criterioOrdenacao: 'relevancia',
    somenteComCapa: false,
  }

  async function carregarFavoritos() {
    if (!servicoFavoritos || typeof servicoFavoritos.listarFavoritos !== 'function') {
      return
    }
    try {
      const lista = await servicoFavoritos.listarFavoritos()
      if (Array.isArray(lista)) {
        idsFavoritos = new Set(lista.map((item) => item?.id).filter(Boolean))
      }
    } catch {
      idsFavoritos = new Set()
    }
  }

  function criarAvisoCache(horario) {
    const aviso = document.createElement('div')
    aviso.className = 'resultados__aviso-cache'
    aviso.setAttribute('role', 'status')

    const texto = document.createElement('span')
    texto.textContent = `Sem internet — exibindo dados de ${horario}`

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'resultados__botao-secundario'
    btn.textContent = 'Tentar de novo'
    btn.addEventListener('click', carregar)

    aviso.append(texto, btn)
    return aviso
  }

  function exibirLivros(resultado, horarioCache = null) {
    limparEstado(estado)

    if (horarioCache) {
      estado.append(criarAvisoCache(horarioCache))
    }

    if (!resultado.livros.length) {
      const mensagem = document.createElement('p')
      mensagem.className = 'livros__mensagem'
      mensagem.textContent =
        'Nenhum livro encontrado para este assunto. Tente outra busca.'
      estado.append(mensagem)
      return
    }

    const controles = document.createElement('div')
    controles.className = 'resultados__controles'

    const grupoOrdem = document.createElement('div')
    grupoOrdem.className = 'resultados__grupo'
    const rotuloOrdem = document.createElement('label')
    rotuloOrdem.className = 'resultados__rotulo'
    rotuloOrdem.setAttribute('for', 'ordenacao-resultados')
    rotuloOrdem.textContent = 'Ordenar por'
    const selectOrdem = document.createElement('select')
    selectOrdem.id = 'ordenacao-resultados'
    selectOrdem.className = 'resultados__select'
    const opcoes = [
      ['relevancia', 'Relevância (ordem da busca)'],
      ['titulo-az', 'Título (A–Z)'],
      ['ano-recente', 'Ano (mais recentes primeiro)'],
      ['ano-antigo', 'Ano (mais antigos primeiro)'],
      ['edicoes', 'Mais edições publicadas'],
    ]
    for (const [valor, texto] of opcoes) {
      const opcao = document.createElement('option')
      opcao.value = valor
      opcao.textContent = texto
      selectOrdem.append(opcao)
    }
    selectOrdem.value = filtros.criterioOrdenacao
    grupoOrdem.append(rotuloOrdem, selectOrdem)

    const grupoFiltro = document.createElement('div')
    grupoFiltro.className = 'resultados__grupo'
    const rotuloFiltro = document.createElement('label')
    rotuloFiltro.className = 'resultados__rotulo'
    rotuloFiltro.setAttribute('for', 'filtro-texto-resultados')
    rotuloFiltro.textContent = 'Filtrar por título ou autor'
    const inputFiltro = document.createElement('input')
    inputFiltro.id = 'filtro-texto-resultados'
    inputFiltro.className = 'resultados__campo'
    inputFiltro.type = 'search'
    inputFiltro.placeholder = 'Ex.: nome do autor ou palavra do título'
    inputFiltro.value = filtros.termoFiltro
    grupoFiltro.append(rotuloFiltro, inputFiltro)

    const labelCapa = document.createElement('label')
    labelCapa.className = 'resultados__checkbox-linha'
    const checkCapa = document.createElement('input')
    checkCapa.type = 'checkbox'
    checkCapa.checked = filtros.somenteComCapa
    const textoCapa = document.createElement('span')
    textoCapa.textContent = 'Apenas livros com capa disponível'
    labelCapa.append(checkCapa, textoCapa)

    const contagem = document.createElement('p')
    contagem.className = 'resultados__contagem'
    contagem.setAttribute('aria-live', 'polite')

    controles.append(grupoOrdem, grupoFiltro, labelCapa, contagem)

    const areaLista = document.createElement('div')

    function atualizarLista() {
      const livrosVisiveis = filtrarEOrdenarLivros(resultado.livros, filtros)
      contagem.textContent = `Exibindo ${livrosVisiveis.length} de ${resultado.livros.length} livros`
      areaLista.replaceChildren()

      if (!livrosVisiveis.length) {
        const msg = document.createElement('p')
        msg.className = 'livros__mensagem'
        msg.textContent = 'Nenhum livro corresponde ao filtro aplicado.'
        const btnLimpar = document.createElement('button')
        btnLimpar.type = 'button'
        btnLimpar.className = 'resultados__botao-secundario'
        btnLimpar.textContent = 'Limpar filtro'
        btnLimpar.addEventListener('click', () => {
          filtros.termoFiltro = ''
          filtros.criterioOrdenacao = 'relevancia'
          filtros.somenteComCapa = false
          inputFiltro.value = ''
          selectOrdem.value = 'relevancia'
          checkCapa.checked = false
          atualizarLista()
        })
        areaLista.append(msg, btnLimpar)
        return
      }

      const lista = document.createElement('ul')
      lista.className = 'livros__lista'

      for (const livro of livrosVisiveis) {
        const item = document.createElement('li')
        item.className = 'livro'
        const info = criarInformacoes(livro, true)

        if (servicoFavoritos && typeof servicoFavoritos.alternarFavorito === 'function') {
          const acoes = document.createElement('div')
          acoes.className = 'resultados__acoes-livro'
          const btnFav = document.createElement('button')
          btnFav.type = 'button'
          btnFav.className = 'resultados__botao-secundario'
          const salvo = idsFavoritos.has(livro.id)
          btnFav.setAttribute('aria-pressed', salvo ? 'true' : 'false')
          btnFav.textContent = salvo ? 'Remover favorito' : 'Salvar favorito'
          btnFav.addEventListener('click', async () => {
            try {
              const ficouSalvo = await servicoFavoritos.alternarFavorito(livro)
              if (ficouSalvo) idsFavoritos.add(livro.id)
              else idsFavoritos.delete(livro.id)
              atualizarLista()
            } catch {
              // Mantém estado atual caso a gravação nativa falhe
            }
          })
          acoes.append(btnFav)
          info.append(acoes)
        }

        item.append(criarCapa(livro), info)
        lista.append(item)
      }

      areaLista.append(lista)
    }

    selectOrdem.addEventListener('change', () => {
      filtros.criterioOrdenacao = selectOrdem.value
      atualizarLista()
    })
    inputFiltro.addEventListener('input', () => {
      filtros.termoFiltro = inputFiltro.value
      atualizarLista()
    })
    checkCapa.addEventListener('change', () => {
      filtros.somenteComCapa = checkCapa.checked
      atualizarLista()
    })

    atualizarLista()
    estado.append(controles, areaLista)
  }

  async function carregar() {
    const atual = ++requisicao
    const chaveCache = normalizarChaveAssunto(assunto)
    mostrarCarregamento(estado, 3)

    try {
      const [resultado] = await Promise.all([
        buscarLivrosPorAssunto(assunto),
        carregarFavoritos(),
      ])

      if (!secao.isConnected || atual !== requisicao) return

      if (servicoCache && typeof servicoCache.salvarCacheBusca === 'function') {
        try {
          await servicoCache.salvarCacheBusca(chaveCache, resultado)
        } catch {
          // Falha ao salvar cache não impede a exibição dos resultados reais
        }
      }

      exibirLivros(resultado)
    } catch (erro) {
      if (!secao.isConnected || atual !== requisicao) return

      const semInternet =
        erro?.tipo === TIPOS_ERRO_API.SEM_INTERNET || Boolean(erro?.semInternet)

      if (
        semInternet &&
        servicoCache &&
        typeof servicoCache.lerCacheBusca === 'function'
      ) {
        try {
          const [registroCache] = await Promise.all([
            servicoCache.lerCacheBusca(chaveCache),
            carregarFavoritos(),
          ])
          if (!secao.isConnected || atual !== requisicao) return
          if (registroCache?.dados) {
            exibirLivros(
              registroCache.dados,
              registroCache.atualizadoEm || 'horário anterior',
            )
            return
          }
        } catch {
          // Segue para exibição padrão de erro sem internet
        }
      }

      mostrarErro(estado, erro, carregar)
    }
  }

  carregar()
}

export default {
  caminho: '/resultados',
  titulo: 'Resultados',
  renderizar: renderizarResultados,
}
