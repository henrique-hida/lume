import './resultados.css'
import { buscarLivrosPorAssunto, TIPOS_ERRO_API } from '../../servicos/api.js'

let contadorRequisicao = 0

/**
 * Pontos de integração opcionais para os serviços de Enzo (cache e favoritos).
 * Permitem que a tela funcione isoladamente agora e se conecte aos serviços
 * de persistência assim que estiverem disponíveis.
 */
let servicoCache = null
let servicoFavoritos = null

export function configurarPersistenciaResultados({ cache, favoritos } = {}) {
  if (cache) servicoCache = cache
  if (favoritos) servicoFavoritos = favoritos
}

/**
 * Escapa caracteres especiais para evitar injeção de HTML ao interpolar dados externos.
 */
function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Extrai o assunto pesquisado a partir do hash atual (ex.: "#/resultados?assunto=fantasia").
 */
export function extrairAssuntoDoHash(hash = window.location.hash) {
  if (typeof hash !== 'string') return ''
  const indiceInterrogacao = hash.indexOf('?')
  if (indiceInterrogacao !== -1) {
    const parametros = new URLSearchParams(hash.slice(indiceInterrogacao + 1))
    return (parametros.get('assunto') ?? parametros.get('q') ?? '').trim()
  }

  const partes = hash.replace(/^#\/?/, '').split('/')
  if (partes[0] === 'resultados' && partes[1]) {
    try {
      return decodeURIComponent(partes.slice(1).join('/')).trim()
    } catch {
      return partes.slice(1).join('/').trim()
    }
  }
  return ''
}

/**
 * Confere se o usuário continua na rota de resultados correspondente ao assunto consultado.
 */
function continuaNaMesmaRotaResultados(assuntoEsperado) {
  const hashAtual = window.location.hash || ''
  if (!hashAtual.startsWith('#/resultados')) return false
  return extrairAssuntoDoHash(hashAtual) === assuntoEsperado
}

/**
 * Normaliza a chave do assunto para uso consistente no cache de busca.
 */
function normalizarChaveAssunto(assunto) {
  return String(assunto ?? '').trim().toLowerCase()
}

/**
 * Aplica filtro textual, filtro de capa e critério de ordenação no próprio aplicativo
 * (cumprindo o requisito da tela Resultados sem nova requisição à API).
 */
export function filtrarEOrdenarLivros(
  livros,
  { termoFiltro = '', criterioOrdenacao = 'relevancia', somenteComCapa = false } = {},
) {
  const termoNormalizado = termoFiltro.trim().toLowerCase()

  const filtrados = livros.filter(livro => {
    if (somenteComCapa && !livro.capaUrl) {
      return false
    }

    if (!termoNormalizado) {
      return true
    }

    const tituloMatch = livro.titulo.toLowerCase().includes(termoNormalizado)
    const autorMatch = livro.autores.some(autor =>
      autor.toLowerCase().includes(termoNormalizado),
    )
    return tituloMatch || autorMatch
  })

  const listaOrdenada = [...filtrados]

  if (criterioOrdenacao === 'titulo-az') {
    listaOrdenada.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
  } else if (criterioOrdenacao === 'ano-recente') {
    listaOrdenada.sort(
      (a, b) => (b.anoPublicacao ?? -Infinity) - (a.anoPublicacao ?? -Infinity),
    )
  } else if (criterioOrdenacao === 'ano-antigo') {
    listaOrdenada.sort(
      (a, b) => (a.anoPublicacao ?? Infinity) - (b.anoPublicacao ?? Infinity),
    )
  } else if (criterioOrdenacao === 'edicoes') {
    listaOrdenada.sort(
      (a, b) => (b.numeroEdicoes ?? 0) - (a.numeroEdicoes ?? 0),
    )
  }

  return listaOrdenada
}

/**
 * Renderiza um card de livro individual na lista de resultados.
 */
function criarHtmlCardLivro(livro, idsFavoritos = new Set()) {
  const autoresTexto =
    livro.autores.length > 0
      ? livro.autores.join(', ')
      : 'Autor não informado'

  const anoTexto = livro.anoPublicacao
    ? `Publicado em ${livro.anoPublicacao}`
    : 'Ano não informado'

  const edicoesTexto =
    livro.numeroEdicoes > 0
      ? `${livro.numeroEdicoes} ${livro.numeroEdicoes === 1 ? 'edição' : 'edições'}`
      : ''

  const capaHtml = livro.capaUrl
    ? `<img class="resultados__capa" src="${escaparHtml(livro.capaUrl)}" alt="Capa de ${escaparHtml(livro.titulo)}" loading="lazy">`
    : `<span class="resultados__sem-capa">Sem capa</span>`

  const tagsHtml = livro.assuntos
    .slice(0, 3)
    .map(tag => `<span class="resultados__tag">${escaparHtml(tag)}</span>`)
    .join('')

  const ehFavorito = idsFavoritos.has(livro.id)
  const botaoFavoritoHtml = servicoFavoritos
    ? `<button type="button" class="resultados__botao resultados__botao--secundario" data-acao="favoritar" data-id="${escaparHtml(livro.id)}" aria-pressed="${ehFavorito ? 'true' : 'false'}">
        ${ehFavorito ? 'Remover favorito' : 'Salvar favorito'}
      </button>`
    : ''

  return `
    <li class="resultados__card">
      <div class="resultados__capa-container">
        ${capaHtml}
      </div>
      <div class="resultados__info">
        <h2 class="resultados__livro-titulo">${escaparHtml(livro.titulo)}</h2>
        <p class="resultados__livro-autor">${escaparHtml(autoresTexto)}</p>
        <div class="resultados__meta">
          <span>${escaparHtml(anoTexto)}</span>
          ${edicoesTexto ? `<span>• ${escaparHtml(edicoesTexto)}</span>` : ''}
        </div>
        ${tagsHtml ? `<div class="resultados__assuntos">${tagsHtml}</div>` : ''}
        <div class="resultados__acoes-card">
          <a class="resultados__botao" href="#/detalhe/${encodeURIComponent(livro.id)}">
            Ver detalhes
          </a>
          ${botaoFavoritoHtml}
        </div>
      </div>
    </li>
  `
}

/**
 * Função principal de renderização da tela de Resultados.
 */
export async function resultados(app) {
  const assunto = extrairAssuntoDoHash()
  const idRequisicao = ++contadorRequisicao

  const estadoControles = {
    termoFiltro: '',
    criterioOrdenacao: 'relevancia',
    somenteComCapa: false,
  }

  let livrosCarregados = []
  let totalEncontradosApi = 0
  let horarioCacheOffline = null
  let idsFavoritos = new Set()

  function renderizarCabecalhoBase() {
    return `
      <header class="resultados__cabecalho">
        <h1 class="resultados__titulo">
          ${assunto ? `Resultados para "${escaparHtml(assunto)}"` : 'Explorar livros por assunto'}
        </h1>
        <p class="resultados__subtitulo">
          Que livros existem sobre o assunto que você quer ler agora?
        </p>
        <form class="resultados__busca-form" id="form-busca-resultados" role="search">
          <input
            id="campo-assunto-resultados"
            class="resultados__busca-campo"
            type="search"
            name="assunto"
            placeholder="Ex.: fantasia, história, programação..."
            value="${escaparHtml(assunto)}"
            aria-label="Assunto para buscar livros"
            required
          >
          <button type="submit" class="resultados__botao">Buscar</button>
        </form>
      </header>
    `
  }

  function vincularEventoBuscaAssunto() {
    const formBusca = app.querySelector('#form-busca-resultados')
    if (!formBusca) return

    formBusca.addEventListener('submit', evento => {
      evento.preventDefault()
      const campo = app.querySelector('#campo-assunto-resultados')
      const novoAssunto = campo ? campo.value.trim() : ''
      if (!novoAssunto) return

      const novoHash = `#/resultados?assunto=${encodeURIComponent(novoAssunto)}`
      if (window.location.hash === novoHash) {
        executarBusca()
      } else {
        window.location.hash = novoHash
      }
    })
  }

  function renderizarEstadoCarregando() {
    app.innerHTML = `
      <section class="tela resultados" aria-busy="true">
        ${renderizarCabecalhoBase()}
        <div class="resultados__estado" role="status" aria-live="polite">
          <h2 class="resultados__estado-titulo">Carregando livros...</h2>
          <p class="resultados__estado-texto">
            Consultando a Open Library sobre "${escaparHtml(assunto)}".
          </p>
        </div>
      </section>
    `
    vincularEventoBuscaAssunto()
  }

  function renderizarEstadoSemAssunto() {
    app.innerHTML = `
      <section class="tela resultados">
        ${renderizarCabecalhoBase()}
        <div class="resultados__estado" role="status">
          <h2 class="resultados__estado-titulo">Informe um assunto para começar</h2>
          <p class="resultados__estado-texto">
            Digite um tema no campo acima ou volte para a tela inicial para descobrir livros.
          </p>
          <div class="resultados__estado-acoes">
            <a class="resultados__botao resultados__botao--secundario" href="#/inicio">
              Ir para o Início
            </a>
          </div>
        </div>
      </section>
    `
    vincularEventoBuscaAssunto()
  }

  function renderizarEstadoVazio() {
    app.innerHTML = `
      <section class="tela resultados">
        ${renderizarCabecalhoBase()}
        ${
          horarioCacheOffline
            ? `<div class="resultados__aviso-cache" role="status">
                <span>Sem internet — dados de ${escaparHtml(horarioCacheOffline)}</span>
                <button type="button" class="resultados__botao resultados__botao--secundario" id="btn-tentar-novamente-cache">
                  Tentar de novo
                </button>
              </div>`
            : ''
        }
        <div class="resultados__estado" role="status">
          <h2 class="resultados__estado-titulo">Nenhum livro encontrado</h2>
          <p class="resultados__estado-texto">
            Não encontramos obras na Open Library para o assunto "${escaparHtml(assunto)}". Tente outro termo (em português ou inglês, como "fantasy" ou "history").
          </p>
          <div class="resultados__estado-acoes">
            <a class="resultados__botao resultados__botao--secundario" href="#/inicio">
              Nova busca no Início
            </a>
          </div>
        </div>
      </section>
    `
    vincularEventoBuscaAssunto()
    const btnCache = app.querySelector('#btn-tentar-novamente-cache')
    if (btnCache) {
      btnCache.addEventListener('click', () => executarBusca())
    }
  }

  function renderizarEstadoErro(erro) {
    const semInternet =
      erro?.tipo === TIPOS_ERRO_API.SEM_INTERNET || Boolean(erro?.semInternet)

    const tituloErro = semInternet
      ? 'Você está sem conexão com a internet'
      : 'Não foi possível carregar os resultados'

    const mensagemErro = semInternet
      ? 'Verifique sua conexão ou o modo avião. Não há dados salvos no aparelho para este assunto.'
      : (erro?.message ?? 'Ocorreu uma falha ao consultar a Open Library.')

    app.innerHTML = `
      <section class="tela resultados">
        ${renderizarCabecalhoBase()}
        <div class="resultados__estado resultados__estado--erro" role="alert">
          <h2 class="resultados__estado-titulo">${escaparHtml(tituloErro)}</h2>
          <p class="resultados__estado-texto">${escaparHtml(mensagemErro)}</p>
          <div class="resultados__estado-acoes">
            <button type="button" class="resultados__botao" id="btn-tentar-novamente">
              Tentar de novo
            </button>
            <a class="resultados__botao resultados__botao--secundario" href="#/inicio">
              Voltar ao Início
            </a>
          </div>
        </div>
      </section>
    `
    vincularEventoBuscaAssunto()
    const btnTentar = app.querySelector('#btn-tentar-novamente')
    if (btnTentar) {
      btnTentar.addEventListener('click', () => executarBusca())
    }
  }

  function atualizarListaFiltrada() {
    const containerLista = app.querySelector('#resultados-lista-container')
    const elementoContagem = app.querySelector('#resultados-contagem')
    if (!containerLista || !elementoContagem) return

    const livrosVisiveis = filtrarEOrdenarLivros(livrosCarregados, estadoControles)

    elementoContagem.textContent = `Exibindo ${livrosVisiveis.length} de ${livrosCarregados.length} livros carregados (${totalEncontradosApi} encontrados na Open Library)`

    if (livrosVisiveis.length === 0) {
      containerLista.innerHTML = `
        <div class="resultados__estado" role="status">
          <h2 class="resultados__estado-titulo">Nenhum livro corresponde ao filtro atual</h2>
          <p class="resultados__estado-texto">
            Altere o texto do filtro ou desmarque a opção "Apenas livros com capa".
          </p>
          <div class="resultados__estado-acoes">
            <button type="button" class="resultados__botao resultados__botao--secundario" id="btn-limpar-filtros">
              Limpar filtro
            </button>
          </div>
        </div>
      `
      const btnLimpar = containerLista.querySelector('#btn-limpar-filtros')
      if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
          estadoControles.termoFiltro = ''
          estadoControles.criterioOrdenacao = 'relevancia'
          estadoControles.somenteComCapa = false

          const inputFiltro = app.querySelector('#filtro-texto-resultados')
          const selectOrdem = app.querySelector('#ordenacao-resultados')
          const checkCapa = app.querySelector('#filtro-capa-resultados')

          if (inputFiltro) inputFiltro.value = ''
          if (selectOrdem) selectOrdem.value = 'relevancia'
          if (checkCapa) checkCapa.checked = false

          atualizarListaFiltrada()
        })
      }
      return
    }

    containerLista.innerHTML = `
      <ul class="resultados__lista">
        ${livrosVisiveis.map(livro => criarHtmlCardLivro(livro, idsFavoritos)).join('')}
      </ul>
    `
  }

  function renderizarResultadosComControles() {
    app.innerHTML = `
      <section class="tela resultados">
        ${renderizarCabecalhoBase()}
        ${
          horarioCacheOffline
            ? `<div class="resultados__aviso-cache" role="status">
                <span>Sem internet — exibindo dados de ${escaparHtml(horarioCacheOffline)}</span>
                <button type="button" class="resultados__botao resultados__botao--secundario" id="btn-tentar-novamente-cache">
                  Tentar de novo
                </button>
              </div>`
            : ''
        }
        <div class="resultados__controles" aria-label="Opções de filtro e ordenação">
          <div class="resultados__controle-grupo">
            <label class="resultados__rotulo" for="ordenacao-resultados">
              Ordenar por
            </label>
            <select id="ordenacao-resultados" class="resultados__select">
              <option value="relevancia">Relevância (padrão da busca)</option>
              <option value="titulo-az">Título (A–Z)</option>
              <option value="ano-recente">Ano (mais recentes primeiro)</option>
              <option value="ano-antigo">Ano (mais antigos primeiro)</option>
              <option value="edicoes">Maior número de edições</option>
            </select>
          </div>

          <div class="resultados__controle-grupo">
            <label class="resultados__rotulo" for="filtro-texto-resultados">
              Filtrar por título ou autor nos resultados
            </label>
            <input
              id="filtro-texto-resultados"
              class="resultados__input"
              type="search"
              placeholder="Digite parte do título ou autor..."
              value="${escaparHtml(estadoControles.termoFiltro)}"
            >
          </div>

          <label class="resultados__checkbox-linha" for="filtro-capa-resultados">
            <input
              id="filtro-capa-resultados"
              type="checkbox"
              ${estadoControles.somenteComCapa ? 'checked' : ''}
            >
            <span>Apenas livros com capa disponível</span>
          </label>

          <p id="resultados-contagem" class="resultados__contagem" aria-live="polite"></p>
        </div>

        <div id="resultados-lista-container"></div>
      </section>
    `

    vincularEventoBuscaAssunto()

    const selectOrdem = app.querySelector('#ordenacao-resultados')
    const inputFiltro = app.querySelector('#filtro-texto-resultados')
    const checkCapa = app.querySelector('#filtro-capa-resultados')
    const btnCache = app.querySelector('#btn-tentar-novamente-cache')
    const containerLista = app.querySelector('#resultados-lista-container')

    if (selectOrdem) {
      selectOrdem.value = estadoControles.criterioOrdenacao
      selectOrdem.addEventListener('change', evento => {
        estadoControles.criterioOrdenacao = evento.target.value
        atualizarListaFiltrada()
      })
    }

    if (inputFiltro) {
      inputFiltro.addEventListener('input', evento => {
        estadoControles.termoFiltro = evento.target.value
        atualizarListaFiltrada()
      })
    }

    if (checkCapa) {
      checkCapa.addEventListener('change', evento => {
        estadoControles.somenteComCapa = evento.target.checked
        atualizarListaFiltrada()
      })
    }

    if (btnCache) {
      btnCache.addEventListener('click', () => executarBusca())
    }

    if (containerLista && servicoFavoritos) {
      containerLista.addEventListener('click', async evento => {
        const botaoFavoritar = evento.target.closest('[data-acao="favoritar"]')
        if (!botaoFavoritar) return

        const idLivro = botaoFavoritar.getAttribute('data-id')
        const livroAlvo = livrosCarregados.find(item => item.id === idLivro)
        if (!livroAlvo) return

        try {
          if (typeof servicoFavoritos.alternarFavorito === 'function') {
            const ficouFavorito = await servicoFavoritos.alternarFavorito(livroAlvo)
            if (ficouFavorito) {
              idsFavoritos.add(idLivro)
            } else {
              idsFavoritos.delete(idLivro)
            }
            atualizarListaFiltrada()
          }
        } catch {
          // Mantém o estado visual atual caso a gravação nativa falhe
        }
      })
    }

    atualizarListaFiltrada()
  }

  async function carregarIdsFavoritos() {
    if (!servicoFavoritos || typeof servicoFavoritos.listarFavoritos !== 'function') {
      return
    }
    try {
      const lista = await servicoFavoritos.listarFavoritos()
      if (Array.isArray(lista)) {
        idsFavoritos = new Set(lista.map(item => item?.id).filter(Boolean))
      }
    } catch {
      idsFavoritos = new Set()
    }
  }

  async function executarBusca() {
    if (!assunto) {
      renderizarEstadoSemAssunto()
      return
    }

    renderizarEstadoCarregando()
    const chaveCache = normalizarChaveAssunto(assunto)

    try {
      const [resposta] = await Promise.all([
        buscarLivrosPorAssunto(assunto, { limite: 20 }),
        carregarIdsFavoritos(),
      ])

      if (
        idRequisicao !== contadorRequisicao ||
        !continuaNaMesmaRotaResultados(assunto)
      ) {
        return
      }

      livrosCarregados = resposta.livros
      totalEncontradosApi = resposta.totalEncontrados
      horarioCacheOffline = null

      if (servicoCache && typeof servicoCache.salvarCacheBusca === 'function') {
        try {
          await servicoCache.salvarCacheBusca(chaveCache, resposta)
        } catch {
          // Falha no armazenamento de cache não deve interromper a exibição dos resultados reais
        }
      }

      if (livrosCarregados.length === 0) {
        renderizarEstadoVazio()
        return
      }

      renderizarResultadosComControles()
    } catch (erro) {
      if (
        idRequisicao !== contadorRequisicao ||
        !continuaNaMesmaRotaResultados(assunto)
      ) {
        return
      }

      const semInternet =
        erro?.tipo === TIPOS_ERRO_API.SEM_INTERNET || Boolean(erro?.semInternet)

      if (
        semInternet &&
        servicoCache &&
        typeof servicoCache.lerCacheBusca === 'function'
      ) {
        try {
          const registroCache = await servicoCache.lerCacheBusca(chaveCache)
          if (registroCache && registroCache.dados) {
            livrosCarregados = Array.isArray(registroCache.dados.livros)
              ? registroCache.dados.livros
              : []
            totalEncontradosApi =
              registroCache.dados.totalEncontrados ?? livrosCarregados.length
            horarioCacheOffline = registroCache.atualizadoEm || 'horário anterior'

            if (livrosCarregados.length === 0) {
              renderizarEstadoVazio()
            } else {
              renderizarResultadosComControles()
            }
            return
          }
        } catch {
          // Se a leitura do cache falhar, exibe o estado de erro/sem internet padrão
        }
      }

      renderizarEstadoErro(erro)
    }
  }

  await executarBusca()
}

export default {
  url: '#/resultados',
  pagina: resultados,
}
