import '../css/tokens.css'
import '../css/base.css'
import '../css/style.css'
import { encontrarRota } from './rotas/rotas.js'
import { renderizarNavbar } from './navbar/navbar.js'
import { renderizarNaoEncontrada } from './paginas/nao-encontrada/nao-encontrada.js'
import { configurarPersistenciaResultados } from './paginas/resultados/resultados.js'
import { configurarPersistenciaDetalhe } from './paginas/detalhe/detalhe.js'
import servicoCache from './servicos/cache.js'
import servicoFavoritos from './servicos/favoritos.js'

configurarPersistenciaResultados({
  cache: servicoCache,
  favoritos: servicoFavoritos,
})
configurarPersistenciaDetalhe({
  cache: servicoCache,
  favoritos: servicoFavoritos,
})

const app = document.querySelector('#app')
app.innerHTML = `
  <header class="cabecalho">
    <div class="cabecalho__conteudo">
      <a class="marca" href="#/inicio"><span class="marca__simbolo" aria-hidden="true">✳</span> lume</a>
      <nav class="menu" aria-label="Navegação principal"></nav>
    </div>
  </header>
  <main class="conteudo" id="conteudo" tabindex="-1"></main>
  <footer class="rodape">Lume · Descubra sua próxima leitura</footer>`

const conteudo = app.querySelector('#conteudo')
const navbar = app.querySelector('.menu')

function navegar() {
  const hash = window.location.hash.slice(1) || '/inicio'
  const [caminho, consulta = ''] = hash.split('?')
  const rota = encontrarRota(caminho)
  renderizarNavbar(navbar, rota)
  if (rota) rota.renderizar(conteudo, { rota, caminho, consulta: new URLSearchParams(consulta) })
  else renderizarNaoEncontrada(conteudo)
}

window.addEventListener('hashchange', navegar)
navegar()
