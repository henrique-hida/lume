const PREFIXO_CHAVE_CACHE = 'lume:cache:busca:'
const CHAVE_ULTIMA_ATUALIZACAO = 'lume:cache:ultima-atualizacao'

const cacheEmMemoria = new Map()
let ultimaAtualizacaoEmMemoria = null

/**
 * Normaliza a chave da busca para evitar duplicações por espaços ou maiúsculas.
 */
export function normalizarChaveCache(chaveBusca) {
  return String(chaveBusca ?? '').trim().toLowerCase()
}

/**
 * Formata um instante no padrão "14h32" exigido para avisos de cache e tela Sobre.
 */
export function formatarHorarioCache(data = new Date()) {
  const instancia = data instanceof Date ? data : new Date(data)
  if (Number.isNaN(instancia.getTime())) {
    return null
  }
  const horas = String(instancia.getHours()).padStart(2, '0')
  const minutos = String(instancia.getMinutes()).padStart(2, '0')
  return `${horas}h${minutos}`
}

function obterStorageDisponivel() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch {
    return null
  }
  return null
}

/**
 * Salva a última resposta convertida de cada busca, junto com o horário formatado.
 * Em caso de indisponibilidade ou limite do localStorage, mantém cópia em memória
 * para não interromper o fluxo de uso.
 *
 * @param {string} chaveBusca Chave normalizada da consulta (ex.: "fantasia" ou "detalhe:OL29226517W").
 * @param {unknown} dados Dados já convertidos para o formato interno do app.
 * @returns {{ dados: unknown, atualizadoEm: string, timestamp: number } | null}
 */
export function salvarCacheBusca(chaveBusca, dados) {
  const chaveNormalizada = normalizarChaveCache(chaveBusca)
  if (!chaveNormalizada || dados === undefined || dados === null) {
    return null
  }

  const timestamp = Date.now()
  const atualizadoEm = formatarHorarioCache(new Date(timestamp))
  const registro = {
    dados,
    atualizadoEm,
    timestamp,
  }

  const chaveStorage = `${PREFIXO_CHAVE_CACHE}${chaveNormalizada}`
  cacheEmMemoria.set(chaveStorage, registro)
  ultimaAtualizacaoEmMemoria = { atualizadoEm, timestamp }

  const storage = obterStorageDisponivel()
  if (storage) {
    try {
      storage.setItem(chaveStorage, JSON.stringify(registro))
      storage.setItem(
        CHAVE_ULTIMA_ATUALIZACAO,
        JSON.stringify(ultimaAtualizacaoEmMemoria),
      )
    } catch {
      // Falha de cota ou modo privado: mantém o registro em memória sem quebrar a tela
    }
  }

  return registro
}

/**
 * Recupera o último registro salvo para uma chave de busca.
 * Preserva registros válidos mesmo quando a lista de livros estiver vazia,
 * distinguindo cache vazio válido de ausência de cache (retorno null).
 *
 * @param {string} chaveBusca Chave da consulta.
 * @returns {{ dados: unknown, atualizadoEm: string, timestamp: number } | null}
 */
export function lerCacheBusca(chaveBusca) {
  const chaveNormalizada = normalizarChaveCache(chaveBusca)
  if (!chaveNormalizada) {
    return null
  }

  const chaveStorage = `${PREFIXO_CHAVE_CACHE}${chaveNormalizada}`
  const storage = obterStorageDisponivel()

  if (storage) {
    try {
      const bruto = storage.getItem(chaveStorage)
      if (bruto !== null) {
        const convertido = JSON.parse(bruto)
        if (
          convertido &&
          typeof convertido === 'object' &&
          'dados' in convertido &&
          convertido.dados !== undefined &&
          convertido.dados !== null
        ) {
          return {
            dados: convertido.dados,
            atualizadoEm:
              typeof convertido.atualizadoEm === 'string' &&
              convertido.atualizadoEm.trim()
                ? convertido.atualizadoEm.trim()
                : formatarHorarioCache(convertido.timestamp),
            timestamp: Number.isFinite(convertido.timestamp)
              ? convertido.timestamp
              : null,
          }
        }
      }
    } catch {
      // JSON corrompido ou erro de leitura: tenta fallback em memória
    }
  }

  return cacheEmMemoria.get(chaveStorage) ?? null
}

/**
 * Retorna o horário formatado (ex.: "14h32") da última atualização de dados registrada
 * no cache local, para exibição na tela Sobre. Retorna null se nenhuma consulta foi salva.
 *
 * @returns {string | null}
 */
export function obterUltimaAtualizacaoGlobal() {
  const storage = obterStorageDisponivel()

  if (storage) {
    try {
      const bruto = storage.getItem(CHAVE_ULTIMA_ATUALIZACAO)
      if (bruto !== null) {
        const convertido = JSON.parse(bruto)
        if (
          convertido &&
          typeof convertido.atualizadoEm === 'string' &&
          convertido.atualizadoEm.trim()
        ) {
          return convertido.atualizadoEm.trim()
        }
      }
    } catch {
      // Ignora erro de leitura e usa fallback em memória
    }
  }

  return ultimaAtualizacaoEmMemoria?.atualizadoEm ?? null
}

export default {
  normalizarChaveCache,
  formatarHorarioCache,
  salvarCacheBusca,
  lerCacheBusca,
  obterUltimaAtualizacaoGlobal,
}
