import './detalhe.css'
import {
  buscarLivroPorId,
  extrairIdObra,
  TIPOS_ERRO_API,
} from '../../servicos/api.js'

let contadorRequisicaoDetalhe = 0

/**
 * Pontos de integração opcionais para os serviços de Enzo (cache e favoritos).
 */
let servicoCache = null
let servicoFavoritos = null

export function configurarPersistenciaDetalhe({ cache, favoritos } = {}) {
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
 * Extrai o identificador da obra a partir da rota atual (ex.: "#/detalhe/OL29226517W"),
 * funcionando inclusive após recarregar a página com F5.
 */
export function extrairIdDoHash(hash = window.location.hash) {
  if (typeof hash !== 'string') return ''

  const semHash = hash.replace(/^#\/?/, '')
  const [caminho, queryString] = semHash.split('?')

  const segmentos = caminho.split('/').filter(Boolean)
  if (segmentos[0] === 'detalhe' && segmentos.length > 1) {
    const bruto = segmentos.slice(1).join('/')
    try {
      return extrairIdObra(decodeURIComponent(bruto))
    } catch {
      return extrairIdObra(bruto)
    }
  }

  if (queryString) {
    const params = new URLSearchParams(queryString)
    return extrairIdObra(params.get('id') ?? '')
  }

  return ''
}

/**
 * Confere se o usuário continua na rota de detalhe correspondente ao ID consultado.
 */
function continuaNaMesmaRotaDetalhe(idEsperado) {
  const hashAtual = window.location.hash || ''
  if (!hashAtual.startsWith('#/detalhe')) return false
  return extrairIdDoHash(hashAtual) === idEsperado
}

/**
 * Converte um `LivroDetalhe` para o resumo salvo nos favoritos do usuário.
 */
function criarResumoParaFavorito(livro) {
  return {
    id: livro.id,
    titulo: livro.titulo,
    autores: Array.isArray(livro.autores) ? livro.autores : [],
    anoPublicacao: livro.anoPublicacao ?? null,
    capaUrl: livro.capaUrl ?? null,
    assuntos: Array.isArray(livro.assuntos) ? livro.assuntos.slice(0, 8) : [],
    numeroEdicoes: livro.numeroEdicoes ?? 0,
  }
}

/**
 * Função principal de renderização da tela de Detalhe.
 *
 * @param {HTMLElement} app Elemento raiz `#app`.
 * @param {{ id?: string }} [parametros] Parâmetros opcionais repassados pelo roteador.
 */
export async function detalhe(app, parametros = {}) {
  const idLivro = extrairIdObra(parametros?.id || extrairIdDoHash())
  const idRequisicao = ++contadorRequisicaoDetalhe

  let livroCarregado = null
  let horarioCacheOffline = null
  let estaNosFavoritos = false

  function renderizarBarraNavegacao() {
    return `
      <nav class="detalhe__navegacao" aria-label="Navegação secundária">
        <button type="button" class="detalhe__botao detalhe__botao--secundario" id="btn-voltar-detalhe">
          Voltar
        </button>
        <a class="detalhe__botao detalhe__botao--secundario" href="#/inicio">
          Início
        </a>
      </nav>
    `
  }

  function vincularBotaoVoltar() {
    const btnVoltar = app.querySelector('#btn-voltar-detalhe')
    if (!btnVoltar) return

    btnVoltar.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.hash = '#/inicio'
      }
    })
  }

  function renderizarEstadoCarregando() {
    app.innerHTML = `
      <section class="tela detalhe" aria-busy="true">
        ${renderizarBarraNavegacao()}
        <div class="detalhe__estado" role="status" aria-live="polite">
          <h1 class="detalhe__estado-titulo">Carregando detalhes do livro...</h1>
          <p class="detalhe__estado-texto">
            Consultando a obra "${escaparHtml(idLivro)}" na Open Library.
          </p>
        </div>
      </section>
    `
    vincularBotaoVoltar()
  }

  function renderizarEstadoVazio(mensagemPersonalizada) {
    app.innerHTML = `
      <section class="tela detalhe">
        ${renderizarBarraNavegacao()}
        <div class="detalhe__estado" role="status">
          <h1 class="detalhe__estado-titulo">Livro não encontrado</h1>
          <p class="detalhe__estado-texto">
            ${escaparHtml(
              mensagemPersonalizada ||
                `Não encontramos nenhuma obra com o identificador "${idLivro || 'vazio'}" na Open Library.`,
            )}
          </p>
          <div class="detalhe__estado-acoes">
            <a class="detalhe__botao" href="#/inicio">
              Buscar outro assunto
            </a>
          </div>
        </div>
      </section>
    `
    vincularBotaoVoltar()
  }

  function renderizarEstadoErro(erro) {
    const semInternet =
      erro?.tipo === TIPOS_ERRO_API.SEM_INTERNET || Boolean(erro?.semInternet)

    const tituloErro = semInternet
      ? 'Você está sem conexão com a internet'
      : 'Não foi possível carregar os detalhes deste livro'

    const mensagemErro = semInternet
      ? 'Verifique sua conexão ou o modo avião. Este livro ainda não possui dados guardados no aparelho.'
      : (erro?.message ?? 'Ocorreu uma falha ao consultar a Open Library.')

    app.innerHTML = `
      <section class="tela detalhe">
        ${renderizarBarraNavegacao()}
        <div class="detalhe__estado detalhe__estado--erro" role="alert">
          <h1 class="detalhe__estado-titulo">${escaparHtml(tituloErro)}</h1>
          <p class="detalhe__estado-texto">${escaparHtml(mensagemErro)}</p>
          <div class="detalhe__estado-acoes">
            <button type="button" class="detalhe__botao" id="btn-tentar-novamente-detalhe">
              Tentar de novo
            </button>
            <a class="detalhe__botao detalhe__botao--secundario" href="#/inicio">
              Ir para o Início
            </a>
          </div>
        </div>
      </section>
    `
    vincularBotaoVoltar()
    const btnTentar = app.querySelector('#btn-tentar-novamente-detalhe')
    if (btnTentar) {
      btnTentar.addEventListener('click', () => carregarDetalhe())
    }
  }

  function renderizarLivroDetalhe() {
    const livro = livroCarregado
    const autoresTexto =
      livro.autores.length > 0
        ? livro.autores.join(', ')
        : 'Autor não informado'

    const capaHtml = livro.capaUrl
      ? `<img class="detalhe__capa" src="${escaparHtml(livro.capaUrl)}" alt="Capa de ${escaparHtml(livro.titulo)}">`
      : `<span class="detalhe__sem-capa">Sem imagem de capa disponível</span>`

    const sinopseTexto =
      livro.sinopse ||
      'Sinopse não disponível no cadastro desta obra na Open Library.'

    const tagsHtml =
      livro.assuntos.length > 0
        ? `
          <section class="detalhe__secao" aria-labelledby="titulo-assuntos-detalhe">
            <h2 id="titulo-assuntos-detalhe" class="detalhe__secao-titulo">
              Assuntos relacionados (toque para buscar mais livros)
            </h2>
            <ul class="detalhe__tags">
              ${livro.assuntos
                .map(
                  assuntoTag => `
                    <li>
                      <a class="detalhe__tag-link" href="#/resultados?assunto=${encodeURIComponent(assuntoTag)}">
                        ${escaparHtml(assuntoTag)}
                      </a>
                    </li>
                  `,
                )
                .join('')}
            </ul>
          </section>
        `
        : ''

    const linksExternosHtml =
      Array.isArray(livro.linksExternos) && livro.linksExternos.length > 0
        ? `
          <section class="detalhe__secao" aria-labelledby="titulo-links-detalhe">
            <h2 id="titulo-links-detalhe" class="detalhe__secao-titulo">
              Links complementares
            </h2>
            <ul class="detalhe__links-lista">
              ${livro.linksExternos
                .map(
                  item => `
                    <li>
                      <a class="detalhe__link-externo" href="${escaparHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                        ${escaparHtml(item.titulo)}
                      </a>
                    </li>
                  `,
                )
                .join('')}
            </ul>
          </section>
        `
        : ''

    const botaoFavoritoHtml = servicoFavoritos
      ? `
        <button
          type="button"
          class="detalhe__botao"
          id="btn-alternar-favorito-detalhe"
          aria-pressed="${estaNosFavoritos ? 'true' : 'false'}"
        >
          ${estaNosFavoritos ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        </button>
      `
      : ''

    app.innerHTML = `
      <section class="tela detalhe">
        ${renderizarBarraNavegacao()}
        ${
          horarioCacheOffline
            ? `<div class="detalhe__aviso-cache" role="status">
                <span>Sem internet — exibindo dados de ${escaparHtml(horarioCacheOffline)}</span>
                <button type="button" class="detalhe__botao detalhe__botao--secundario" id="btn-tentar-novamente-cache-detalhe">
                  Tentar de novo
                </button>
              </div>`
            : ''
        }
        <article class="detalhe__painel">
          <div class="detalhe__topo">
            <div class="detalhe__capa-wrapper">
              ${capaHtml}
            </div>
            <div class="detalhe__resumo">
              <h1 class="detalhe__titulo">${escaparHtml(livro.titulo)}</h1>
              <p class="detalhe__autores">${escaparHtml(autoresTexto)}</p>
              <ul class="detalhe__metadados">
                <li class="detalhe__metadado-item">
                  ID: ${escaparHtml(livro.id)}
                </li>
                ${
                  livro.anoPublicacao
                    ? `<li class="detalhe__metadado-item">1ª publicação: ${escaparHtml(livro.anoPublicacao)}</li>`
                    : ''
                }
                ${
                  livro.numeroEdicoes > 0
                    ? `<li class="detalhe__metadado-item">${escaparHtml(livro.numeroEdicoes)} ${livro.numeroEdicoes === 1 ? 'edição' : 'edições'}</li>`
                    : ''
                }
              </ul>
              <div class="detalhe__acoes">
                ${botaoFavoritoHtml}
                <a
                  class="detalhe__botao detalhe__botao--secundario"
                  href="${escaparHtml(livro.urlOrigem)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver na Open Library
                </a>
              </div>
            </div>
          </div>

          <section class="detalhe__secao" aria-labelledby="titulo-sinopse-detalhe">
            <h2 id="titulo-sinopse-detalhe" class="detalhe__secao-titulo">Sinopse</h2>
            <p class="detalhe__sinopse">${escaparHtml(sinopseTexto)}</p>
          </section>

          ${tagsHtml}
          ${linksExternosHtml}
        </article>
      </section>
    `

    vincularBotaoVoltar()

    const btnCache = app.querySelector('#btn-tentar-novamente-cache-detalhe')
    if (btnCache) {
      btnCache.addEventListener('click', () => carregarDetalhe())
    }

    const btnFavorito = app.querySelector('#btn-alternar-favorito-detalhe')
    if (btnFavorito && servicoFavoritos) {
      btnFavorito.addEventListener('click', async () => {
        try {
          const resumo = criarResumoParaFavorito(livro)
          if (typeof servicoFavoritos.alternarFavorito === 'function') {
            estaNosFavoritos = await servicoFavoritos.alternarFavorito(resumo)
            renderizarLivroDetalhe()
          }
        } catch {
          // Mantém o estado visual atual se a operação nativa falhar
        }
      })
    }
  }

  async function verificarStatusFavorito(id) {
    if (!servicoFavoritos) return false
    try {
      if (typeof servicoFavoritos.ehFavorito === 'function') {
        return Boolean(await servicoFavoritos.ehFavorito(id))
      }
      if (typeof servicoFavoritos.listarFavoritos === 'function') {
        const lista = await servicoFavoritos.listarFavoritos()
        return Array.isArray(lista) && lista.some(item => item?.id === id)
      }
    } catch {
      return false
    }
    return false
  }

  async function carregarDetalhe() {
    if (!idLivro) {
      renderizarEstadoVazio(
        'Nenhum identificador de livro foi informado no endereço.',
      )
      return
    }

    renderizarEstadoCarregando()
    const chaveCache = `detalhe:${idLivro}`

    try {
      const [dadosLivro, favoritoAtual] = await Promise.all([
        buscarLivroPorId(idLivro),
        verificarStatusFavorito(idLivro),
      ])

      if (
        idRequisicao !== contadorRequisicaoDetalhe ||
        !continuaNaMesmaRotaDetalhe(idLivro)
      ) {
        return
      }

      livroCarregado = dadosLivro
      estaNosFavoritos = favoritoAtual
      horarioCacheOffline = null

      if (servicoCache && typeof servicoCache.salvarCacheBusca === 'function') {
        try {
          await servicoCache.salvarCacheBusca(chaveCache, dadosLivro)
        } catch {
          // Ignora falha de gravação de cache
        }
      }

      renderizarLivroDetalhe()
    } catch (erro) {
      if (
        idRequisicao !== contadorRequisicaoDetalhe ||
        !continuaNaMesmaRotaDetalhe(idLivro)
      ) {
        return
      }

      if (erro?.tipo === TIPOS_ERRO_API.NAO_ENCONTRADO || erro?.status === 404) {
        renderizarEstadoVazio()
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
            livroCarregado = registroCache.dados
            horarioCacheOffline = registroCache.atualizadoEm || 'horário anterior'
            renderizarLivroDetalhe()
            return
          }
        } catch {
          // Se não houver cache válido, cai para o estado de erro/sem internet
        }
      }

      renderizarEstadoErro(erro)
    }
  }

  await carregarDetalhe()
}

export default {
  url: '#/detalhe',
  pagina: detalhe,
}
