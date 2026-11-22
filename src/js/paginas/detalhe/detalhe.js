import './detalhe.css'
import {
  buscarLivroPorId,
  extrairIdObra,
  TIPOS_ERRO_API,
} from '../../servicos/api.js'
import {
  limparEstado,
  mostrarCarregamento,
  mostrarErro,
  criarCapa,
} from '../../componentes/livros.js'

let servicoCache = null
let servicoFavoritos = null

export function configurarPersistenciaDetalhe({ cache, favoritos } = {}) {
  if (cache) servicoCache = cache
  if (favoritos) servicoFavoritos = favoritos
}

export function extrairIdDoHash(hash = window.location.hash) {
  if (typeof hash !== 'string') return ''
  const [caminho = ''] = hash.replace(/^#\/?/, '').split('?')
  const partes = caminho.split('/').filter(Boolean)
  if (partes[0] === 'detalhe' && partes.length > 1) {
    try {
      return extrairIdObra(decodeURIComponent(partes.slice(1).join('/')))
    } catch {
      return extrairIdObra(partes.slice(1).join('/'))
    }
  }
  return ''
}

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

export function renderizarDetalhe(conteudo, contexto = {}) {
  const caminho = contexto.caminho || ''
  const idBruto = caminho.startsWith('/detalhe/')
    ? caminho.slice('/detalhe/'.length)
    : extrairIdDoHash()

  let idDecodificado = idBruto
  try {
    idDecodificado = decodeURIComponent(idBruto)
  } catch {
    idDecodificado = idBruto
  }
  const id = extrairIdObra(idDecodificado)

  conteudo.innerHTML = `
    <section class="livros">
      <h1 class="livros__titulo">Detalhe</h1>
      <div class="livros__estado"></div>
      <a class="livros__voltar" href="#/inicio">Voltar ao início</a>
    </section>
  `

  const secao = conteudo.querySelector('section')
  const tituloPrincipal = secao.querySelector('h1')
  const estado = secao.querySelector('.livros__estado')

  let requisicao = 0
  let estaNosFavoritos = false

  async function verificarFavorito() {
    if (!servicoFavoritos) return false
    try {
      if (typeof servicoFavoritos.ehFavorito === 'function') {
        return Boolean(await servicoFavoritos.ehFavorito(id))
      }
      if (typeof servicoFavoritos.listarFavoritos === 'function') {
        const lista = await servicoFavoritos.listarFavoritos()
        return Array.isArray(lista) && lista.some((item) => item?.id === id)
      }
    } catch {
      return false
    }
    return false
  }

  function criarAvisoCache(horario) {
    const aviso = document.createElement('div')
    aviso.className = 'detalhe__aviso-cache'
    aviso.setAttribute('role', 'status')

    const texto = document.createElement('span')
    texto.textContent = `Sem internet — exibindo dados de ${horario}`

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'detalhe__botao-secundario'
    btn.textContent = 'Tentar de novo'
    btn.addEventListener('click', carregar)

    aviso.append(texto, btn)
    return aviso
  }

  function exibirLivro(livro, horarioCache = null) {
    limparEstado(estado)
    tituloPrincipal.textContent = livro.titulo

    if (horarioCache) {
      estado.append(criarAvisoCache(horarioCache))
    }

    const bloco = document.createElement('div')
    bloco.className = 'livro'

    const dados = document.createElement('div')
    dados.className = 'livro__informacoes'

    const autor = document.createElement('p')
    autor.className = 'livro__meta'
    autor.textContent = livro.autores.length
      ? livro.autores.join(', ')
      : 'Autoria não informada'

    const ano = document.createElement('p')
    ano.className = 'livro__meta'
    ano.textContent = livro.anoPublicacao
      ? `Primeira publicação: ${livro.anoPublicacao}`
      : 'Ano não informado'

    dados.append(autor, ano)

    if (livro.numeroEdicoes > 0) {
      const edicoes = document.createElement('p')
      edicoes.className = 'livro__meta'
      edicoes.textContent = `${livro.numeroEdicoes} ${livro.numeroEdicoes === 1 ? 'edição' : 'edições'}`
      dados.append(edicoes)
    }

    bloco.append(criarCapa(livro), dados)

    const acoes = document.createElement('div')
    acoes.className = 'detalhe__acoes'

    if (servicoFavoritos && typeof servicoFavoritos.alternarFavorito === 'function') {
      const btnFavorito = document.createElement('button')
      btnFavorito.type = 'button'
      btnFavorito.className = 'botao'
      btnFavorito.setAttribute('aria-pressed', estaNosFavoritos ? 'true' : 'false')
      btnFavorito.textContent = estaNosFavoritos
        ? 'Remover dos favoritos'
        : 'Salvar nos favoritos'
      btnFavorito.addEventListener('click', async () => {
        try {
          estaNosFavoritos = await servicoFavoritos.alternarFavorito(
            criarResumoParaFavorito(livro),
          )
          exibirLivro(livro, horarioCache)
        } catch {
          // Mantém estado visual atual se a gravação nativa falhar
        }
      })
      acoes.append(btnFavorito)
    }

    if (livro.urlOrigem) {
      const linkOrigem = document.createElement('a')
      linkOrigem.className = 'detalhe__botao-secundario'
      linkOrigem.href = livro.urlOrigem
      linkOrigem.target = '_blank'
      linkOrigem.rel = 'noopener noreferrer'
      linkOrigem.textContent = 'Ver na Open Library'
      acoes.append(linkOrigem)
    }

    const tituloSinopse = document.createElement('h2')
    tituloSinopse.className = 'livros__secao'
    tituloSinopse.textContent = 'Sobre o livro'

    const sinopse = document.createElement('p')
    sinopse.className = 'livros__sinopse'
    sinopse.textContent = livro.sinopse || 'Sinopse não disponível.'

    estado.append(bloco, acoes, tituloSinopse, sinopse)

    if (Array.isArray(livro.assuntos) && livro.assuntos.length > 0) {
      const tituloAssuntos = document.createElement('h2')
      tituloAssuntos.className = 'livros__secao'
      tituloAssuntos.textContent = 'Assuntos relacionados'

      const listaTags = document.createElement('ul')
      listaTags.className = 'detalhe__tags'

      for (const assuntoTag of livro.assuntos.slice(0, 8)) {
        const li = document.createElement('li')
        const link = document.createElement('a')
        link.className = 'detalhe__tag-link'
        link.href = `#/resultados?assunto=${encodeURIComponent(assuntoTag)}`
        link.textContent = assuntoTag
        li.append(link)
        listaTags.append(li)
      }

      estado.append(tituloAssuntos, listaTags)
    }
  }

  async function carregar() {
    if (!id) {
      limparEstado(estado)
      const mensagem = document.createElement('p')
      mensagem.className = 'livros__mensagem'
      mensagem.textContent = 'Identificador do livro não informado.'
      estado.append(mensagem)
      return
    }

    const atual = ++requisicao
    const chaveCache = `detalhe:${id}`
    mostrarCarregamento(estado)

    try {
      const [livro, favorito] = await Promise.all([
        buscarLivroPorId(id),
        verificarFavorito(),
      ])

      if (!secao.isConnected || atual !== requisicao) return

      estaNosFavoritos = favorito

      if (servicoCache && typeof servicoCache.salvarCacheBusca === 'function') {
        try {
          await servicoCache.salvarCacheBusca(chaveCache, livro)
        } catch {
          // Ignora falha ao gravar cache
        }
      }

      exibirLivro(livro)
    } catch (erro) {
      if (!secao.isConnected || atual !== requisicao) return

      if (erro?.tipo === TIPOS_ERRO_API.NAO_ENCONTRADO || erro?.status === 404) {
        limparEstado(estado)
        const mensagem = document.createElement('p')
        mensagem.className = 'livros__mensagem'
        mensagem.textContent =
          'Livro não encontrado na Open Library. Verifique o endereço ou faça uma nova busca.'
        estado.append(mensagem)
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
          if (registroCache?.dados) {
            exibirLivro(
              registroCache.dados,
              registroCache.atualizadoEm || 'horário anterior',
            )
            return
          }
        } catch {
          // Segue para erro padrão sem internet
        }
      }

      mostrarErro(estado, erro, carregar)
    }
  }

  carregar()
}

export default {
  caminho: '/detalhe/:id',
  titulo: 'Detalhe',
  renderizar: renderizarDetalhe,
}
