import { Preferences } from '@capacitor/preferences'

const CHAVE_FAVORITOS = 'lume_favoritos'

/**
 * Garante que apenas o contrato interno `LivroResumo` seja persistido no aparelho,
 * sem campos externos da Open Library.
 */
function normalizarLivroFavorito(livro) {
  if (!livro || typeof livro !== 'object') {
    return null
  }

  const id = typeof livro.id === 'string' ? livro.id.trim() : ''
  if (!id) {
    return null
  }

  const titulo =
    typeof livro.titulo === 'string' && livro.titulo.trim().length > 0
      ? livro.titulo.trim()
      : 'Título não disponível'

  const autores = Array.isArray(livro.autores)
    ? livro.autores
        .filter((autor) => typeof autor === 'string' && autor.trim().length > 0)
        .map((autor) => autor.trim())
    : []

  const anoPublicacao = Number.isInteger(livro.anoPublicacao)
    ? livro.anoPublicacao
    : null

  const capaUrl =
    typeof livro.capaUrl === 'string' && livro.capaUrl.trim().length > 0
      ? livro.capaUrl.trim()
      : null

  const assuntos = Array.isArray(livro.assuntos)
    ? livro.assuntos
        .filter((assunto) => typeof assunto === 'string' && assunto.trim().length > 0)
        .map((assunto) => assunto.trim())
        .slice(0, 8)
    : []

  const numeroEdicoes = Number.isInteger(livro.numeroEdicoes)
    ? livro.numeroEdicoes
    : 0

  return {
    id,
    titulo,
    autores,
    anoPublicacao,
    capaUrl,
    assuntos,
    numeroEdicoes,
  }
}

async function gravarListaFavoritos(lista) {
  try {
    await Preferences.set({
      key: CHAVE_FAVORITOS,
      value: JSON.stringify(lista),
    })
  } catch (erro) {
    throw new Error('Não foi possível salvar os favoritos no aparelho.', {
      cause: erro,
    })
  }
}

/**
 * Lista todos os livros salvos como favoritos no aparelho via Capacitor Preferences.
 *
 * @returns {Promise<Array<object>>}
 */
export async function listarFavoritos() {
  try {
    const { value } = await Preferences.get({ key: CHAVE_FAVORITOS })
    if (!value) {
      return []
    }

    const convertido = JSON.parse(value)
    if (!Array.isArray(convertido)) {
      return []
    }

    return convertido.map(normalizarLivroFavorito).filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Verifica se um livro (pelo ID da obra) está salvo nos favoritos.
 *
 * @param {string} id Identificador da obra (ex.: "OL29226517W").
 * @returns {Promise<boolean>}
 */
export async function ehFavorito(id) {
  const idLimpo = typeof id === 'string' ? id.trim() : ''
  if (!idLimpo) {
    return false
  }

  const favoritos = await listarFavoritos()
  return favoritos.some((item) => item.id === idLimpo)
}

/**
 * Salva um livro (`LivroResumo`) nos favoritos do aparelho, evitando duplicatas.
 *
 * @param {object} livroResumo Objeto no formato interno `LivroResumo`.
 * @returns {Promise<void>}
 */
export async function salvarFavorito(livroResumo) {
  const livroNormalizado = normalizarLivroFavorito(livroResumo)
  if (!livroNormalizado) {
    return
  }

  const favoritos = await listarFavoritos()
  const semDuplicata = favoritos.filter((item) => item.id !== livroNormalizado.id)
  const atualizados = [livroNormalizado, ...semDuplicata]
  await gravarListaFavoritos(atualizados)
}

/**
 * Remove um livro dos favoritos pelo identificador da obra.
 *
 * @param {string} id Identificador da obra.
 * @returns {Promise<void>}
 */
export async function removerFavorito(id) {
  const idLimpo = typeof id === 'string' ? id.trim() : ''
  if (!idLimpo) {
    return
  }

  const favoritos = await listarFavoritos()
  const atualizados = favoritos.filter((item) => item.id !== idLimpo)
  await gravarListaFavoritos(atualizados)
}

/**
 * Alterna o estado de favorito de um livro no aparelho.
 *
 * @param {object} livroResumo Objeto no formato interno `LivroResumo`.
 * @returns {Promise<boolean>} Retorna true se o livro ficou salvo e false se foi removido.
 */
export async function alternarFavorito(livroResumo) {
  const livroNormalizado = normalizarLivroFavorito(livroResumo)
  if (!livroNormalizado) {
    return false
  }

  const favoritos = await listarFavoritos()
  const jaSalvo = favoritos.some((item) => item.id === livroNormalizado.id)

  if (jaSalvo) {
    const atualizados = favoritos.filter((item) => item.id !== livroNormalizado.id)
    await gravarListaFavoritos(atualizados)
    return false
  }

  await gravarListaFavoritos([livroNormalizado, ...favoritos])
  return true
}

export default {
  listarFavoritos,
  ehFavorito,
  salvarFavorito,
  removerFavorito,
  alternarFavorito,
}
