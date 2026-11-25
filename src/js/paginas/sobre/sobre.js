import './sobre.css'
import { obterUltimaAtualizacaoGlobal } from '../../servicos/cache.js'

export function renderizarSobre(conteudo) {
  const ultimaAtualizacao = obterUltimaAtualizacaoGlobal()

  const textoAtualizacao = ultimaAtualizacao
    ? `Última atualização dos dados às ${ultimaAtualizacao}.`
    : 'Nenhuma busca foi realizada neste aparelho ainda.'

  conteudo.innerHTML = `
    <section class="livros sobre">
      <h1 class="livros__titulo">Sobre</h1>
      <p class="livros__subtitulo">Lume ajuda você a responder: “que livros existem sobre o assunto que eu quero?”</p>

      <article class="sobre__bloco">
        <h2 class="sobre__subtitulo">Origem dos dados</h2>
        <p class="sobre__texto">
          As informações de livros, autores, assuntos, sinopses e capas são obtidas da API aberta da Open Library, projeto mantido pelo Internet Archive, sem necessidade de chave de acesso.
        </p>
        <ul class="sobre__links">
          <li>
            <a class="sobre__link" href="https://openlibrary.org" target="_blank" rel="noopener noreferrer">
              Site oficial da Open Library
            </a>
          </li>
          <li>
            <a class="sobre__link" href="https://openlibrary.org/developers/api" target="_blank" rel="noopener noreferrer">
              Documentação da API Open Library
            </a>
          </li>
        </ul>
      </article>

      <article class="sobre__bloco">
        <h2 class="sobre__subtitulo">Atualização e uso offline</h2>
        <div class="sobre__destaque" role="status">
          <p class="sobre__rotulo">Hora da última atualização</p>
          <p class="sobre__valor"></p>
        </div>
        <p class="sobre__texto">
          A última resposta de cada busca é guardada localmente para exibição com aviso de horário quando o aparelho estiver sem internet.
        </p>
      </article>

      <article class="sobre__bloco">
        <h2 class="sobre__subtitulo">Favoritos no aparelho</h2>
        <p class="sobre__texto">
          Os livros salvos na aba Favoritos ficam armazenados diretamente no dispositivo por meio do recurso nativo Capacitor Preferences.
        </p>
      </article>

      <a class="livros__voltar" href="#/inicio">Voltar ao início</a>
    </section>
  `

  conteudo.querySelector('.sobre__valor').textContent = textoAtualizacao
}

export default {
  caminho: '/sobre',
  titulo: 'Sobre',
  menu: true,
  renderizar: renderizarSobre,
}
