const BASE_URL = 'https://openlibrary.org'
const COVERS_BASE_URL = 'https://covers.openlibrary.org/b/id'

const CAMPOS_BUSCA = [
  'key',
  'title',
  'author_name',
  'first_publish_year',
  'cover_i',
  'subject',
  'edition_count',
].join(',')

/**
 * Tipos de erro padronizados para as telas distinguirem
 * estado sem internet, item não encontrado e falha de servidor/API.
 */
export const TIPOS_ERRO_API = Object.freeze({
  SEM_INTERNET: 'SEM_INTERNET',
  NAO_ENCONTRADO: 'NAO_ENCONTRADO',
  LIMITE_EXCEDIDO: 'LIMITE_EXCEDIDO',
  ERRO_HTTP: 'ERRO_HTTP',
  PARAMETRO_INVALIDO: 'PARAMETRO_INVALIDO',
})

/**
 * Cria um erro padronizado do serviço de API.
 */
function criarErroApi(mensagem, tipo, status = null, causa = null) {
  const erro = new Error(mensagem)
  erro.name = 'ErroApi'
  erro.tipo = tipo
  erro.status = status
  erro.semInternet = tipo === TIPOS_ERRO_API.SEM_INTERNET
  if (causa) {
    erro.cause = causa
  }
  return erro
}

/**
 * Verifica se o ambiente reporta ausência de conexão antes ou após falha do fetch.
 */
function estaSemInternet() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

/**
 * Extrai o identificador limpo da obra (ex.: "/works/OL29226517W" -> "OL29226517W").
 */
export function extrairIdObra(chaveOuId) {
  if (typeof chaveOuId !== 'string') return ''
  return chaveOuId
    .trim()
    .replace(/^\/+/, '')
    .replace(/^works\//i, '')
    .replace(/\.json$/i, '')
    .trim()
}

/**
 * Monta a URL da capa na Open Library Covers API a partir do ID numérico da capa.
 * Retorna null quando o livro não possui capa cadastrada (ou quando o ID é inválido, como -1).
 */
export function montarUrlCapa(coverId, tamanho = 'M') {
  const idNumerico = Number(coverId)
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    return null
  }
  const tamanhoValido = ['S', 'M', 'L'].includes(tamanho) ? tamanho : 'M'
  return `${COVERS_BASE_URL}/${idNumerico}-${tamanhoValido}.jpg`
}

/**
 * Extrai a sinopse do campo `description` da Open Library,
 * que pode vir como string, objeto `{ type, value }` ou ausente.
 */
export function extrairSinopse(description) {
  if (!description) return null
  if (typeof description === 'string') {
    const texto = description.trim()
    return texto.length > 0 ? texto : null
  }
  if (typeof description === 'object' && typeof description.value === 'string') {
    const texto = description.value.trim()
    return texto.length > 0 ? texto : null
  }
  return null
}

/**
 * Extrai o ano numérico de uma string de data (ex.: "1869" ou "1999-05-01").
 */
function extrairAnoDeTexto(textoData) {
  if (typeof textoData !== 'string') return null
  const correspondencia = textoData.match(/\b(\d{4})\b/)
  return correspondencia ? Number(correspondencia[1]) : null
}

/**
 * Converte um registro bruto da busca (`search.json`) para o contrato interno `LivroResumo`.
 * A tela nunca acessa os campos originais em inglês da Open Library.
 */
export function converterLivroBusca(registro) {
  const id = extrairIdObra(registro?.key ?? '')
  const titulo =
    typeof registro?.title === 'string' && registro.title.trim().length > 0
      ? registro.title.trim()
      : 'Título não disponível'

  const autores = Array.isArray(registro?.author_name)
    ? registro.author_name
        .filter(nome => typeof nome === 'string' && nome.trim().length > 0)
        .map(nome => nome.trim())
    : []

  const anoPublicacao = Number.isInteger(registro?.first_publish_year)
    ? registro.first_publish_year
    : null

  const assuntos = Array.isArray(registro?.subject)
    ? registro.subject
        .filter(item => typeof item === 'string' && item.trim().length > 0)
        .slice(0, 8)
    : []

  const numeroEdicoes = Number.isInteger(registro?.edition_count)
    ? registro.edition_count
    : 0

  return {
    id,
    titulo,
    autores,
    anoPublicacao,
    capaUrl: montarUrlCapa(registro?.cover_i, 'M'),
    assuntos,
    numeroEdicoes,
  }
}

/**
 * Converte os dados brutos da obra (`/works/{id}.json`) e o resumo opcional de busca
 * para o contrato interno `LivroDetalhe`.
 */
export function converterLivroDetalhe(dadosObra, registroBusca = null) {
  const resumoBase = registroBusca ? converterLivroBusca(registroBusca) : null

  const id = extrairIdObra(dadosObra?.key ?? resumoBase?.id ?? '')
  const titulo =
    typeof dadosObra?.title === 'string' && dadosObra.title.trim().length > 0
      ? dadosObra.title.trim()
      : (resumoBase?.titulo ?? 'Título não disponível')

  const autores =
    resumoBase && resumoBase.autores.length > 0 ? resumoBase.autores : []

  const anoPublicacao =
    resumoBase?.anoPublicacao ??
    extrairAnoDeTexto(dadosObra?.first_publish_date) ??
    null

  const capasObra = Array.isArray(dadosObra?.covers)
    ? dadosObra.covers.filter(idCapa => Number.isInteger(idCapa) && idCapa > 0)
    : []
  const capaPrincipalId = capasObra[0] ?? registroBusca?.cover_i ?? null

  const assuntosObra = Array.isArray(dadosObra?.subjects)
    ? dadosObra.subjects
        .filter(item => typeof item === 'string' && item.trim().length > 0)
        .slice(0, 12)
    : (resumoBase?.assuntos ?? [])

  const linksExternos = Array.isArray(dadosObra?.links)
    ? dadosObra.links
        .filter(
          link =>
            link &&
            typeof link.url === 'string' &&
            link.url.trim().length > 0,
        )
        .map(link => ({
          titulo:
            typeof link.title === 'string' && link.title.trim().length > 0
              ? link.title.trim()
              : link.url.trim(),
          url: link.url.trim(),
        }))
    : []

  return {
    id,
    titulo,
    autores,
    anoPublicacao,
    capaUrl: montarUrlCapa(capaPrincipalId, 'L') ?? resumoBase?.capaUrl ?? null,
    assuntos: assuntosObra,
    numeroEdicoes: resumoBase?.numeroEdicoes ?? 0,
    sinopse: extrairSinopse(dadosObra?.description),
    linksExternos,
    urlOrigem: id ? `${BASE_URL}/works/${encodeURIComponent(id)}` : BASE_URL,
  }
}

/**
 * Executa uma requisição GET JSON para a Open Library com tratamento padronizado de erros.
 * Único ponto do aplicativo que invoca `fetch` (requisito A1).
 */
async function requisitarJson(url) {
  if (estaSemInternet()) {
    throw criarErroApi(
      'Sem conexão com a internet.',
      TIPOS_ERRO_API.SEM_INTERNET,
    )
  }

  let resposta
  try {
    resposta = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
  } catch (erroRede) {
    throw criarErroApi(
      'Não foi possível conectar à Open Library. Verifique sua conexão.',
      TIPOS_ERRO_API.SEM_INTERNET,
      null,
      erroRede,
    )
  }

  if (!resposta.ok) {
    if (resposta.status === 404) {
      throw criarErroApi(
        'O recurso solicitado não foi encontrado na Open Library.',
        TIPOS_ERRO_API.NAO_ENCONTRADO,
        404,
      )
    }

    if (resposta.status === 403 || resposta.status === 429) {
      throw criarErroApi(
        'Limite de requisições da Open Library atingido temporariamente. Tente novamente em instantes.',
        TIPOS_ERRO_API.LIMITE_EXCEDIDO,
        resposta.status,
      )
    }

    throw criarErroApi(
      `A Open Library retornou um erro inesperado (HTTP ${resposta.status}).`,
      TIPOS_ERRO_API.ERRO_HTTP,
      resposta.status,
    )
  }

  try {
    return await resposta.json()
  } catch (erroJson) {
    throw criarErroApi(
      'A resposta recebida da Open Library não está em um formato JSON válido.',
      TIPOS_ERRO_API.ERRO_HTTP,
      resposta.status,
      erroJson,
    )
  }
}

/**
 * Busca livros por assunto na Open Library e devolve os itens já convertidos para `LivroResumo`.
 *
 * @param {string} assunto Termo ou assunto desejado pelo usuário.
 * @param {{ limite?: number, pagina?: number }} [opcoes] Opções de paginação.
 * @returns {Promise<{ assunto: string, totalEncontrados: number, livros: Array<object> }>}
 */
export async function buscarLivrosPorAssunto(assunto, opcoes = {}) {
  const assuntoLimpo = typeof assunto === 'string' ? assunto.trim() : ''
  if (!assuntoLimpo) {
    throw criarErroApi(
      'Informe um assunto para realizar a busca.',
      TIPOS_ERRO_API.PARAMETRO_INVALIDO,
    )
  }

  const limite =
    Number.isInteger(opcoes.limite) && opcoes.limite > 0 && opcoes.limite <= 50
      ? opcoes.limite
      : 20
  const pagina =
    Number.isInteger(opcoes.pagina) && opcoes.pagina > 0 ? opcoes.pagina : 1

  const parametros = new URLSearchParams({
    subject: assuntoLimpo,
    limit: String(limite),
    page: String(pagina),
    fields: CAMPOS_BUSCA,
  })

  const url = `${BASE_URL}/search.json?${parametros.toString()}`

  try {
    const dados = await requisitarJson(url)
    const listaBruta = Array.isArray(dados?.docs) ? dados.docs : []
    const livros = listaBruta
      .map(converterLivroBusca)
      .filter(livro => Boolean(livro.id))

    const totalEncontrados = Number.isInteger(dados?.numFound)
      ? dados.numFound
      : livros.length

    return {
      assunto: assuntoLimpo,
      totalEncontrados,
      livros,
    }
  } catch (erro) {
    if (erro?.name === 'ErroApi') {
      throw erro
    }
    throw criarErroApi(
      'Falha ao buscar livros por assunto.',
      TIPOS_ERRO_API.ERRO_HTTP,
      null,
      erro,
    )
  }
}

/**
 * Busca os detalhes completos de um livro pelo identificador da obra (ex.: "OL29226517W").
 * Funciona inclusive ao recarregar a tela de Detalhe (F5), combinando os dados de `/works/{id}.json`
 * com os metadados de autoria e ano de `search.json`.
 *
 * @param {string} id Identificador da obra na rota (ex.: "OL29226517W").
 * @returns {Promise<object>} Objeto no formato `LivroDetalhe`.
 */
export async function buscarLivroPorId(id) {
  const idLimpo = extrairIdObra(id)
  if (!idLimpo) {
    throw criarErroApi(
      'Identificador de livro inválido.',
      TIPOS_ERRO_API.PARAMETRO_INVALIDO,
    )
  }

  const urlObra = `${BASE_URL}/works/${encodeURIComponent(idLimpo)}.json`
  const parametrosResumo = new URLSearchParams({
    q: `key:/works/${idLimpo}`,
    limit: '1',
    fields: CAMPOS_BUSCA,
  })
  const urlResumo = `${BASE_URL}/search.json?${parametrosResumo.toString()}`

  try {
    const [dadosObra, resultadoResumo] = await Promise.all([
      requisitarJson(urlObra),
      requisitarJson(urlResumo).catch(() => null),
    ])

    const registroBusca =
      Array.isArray(resultadoResumo?.docs) && resultadoResumo.docs.length > 0
        ? resultadoResumo.docs[0]
        : null

    return converterLivroDetalhe(dadosObra, registroBusca)
  } catch (erro) {
    if (erro?.name === 'ErroApi') {
      throw erro
    }
    throw criarErroApi(
      'Falha ao carregar os detalhes do livro.',
      TIPOS_ERRO_API.ERRO_HTTP,
      null,
      erro,
    )
  }
}
