import { rotas } from '../rotas/rotas.js'

export function renderizarNavbar(navbar, rotaAtual) {
  navbar.innerHTML = ''
  rotas.filter((rota) => rota.menu).forEach((rota) => {
    const link = document.createElement('a')
    link.className = 'menu__link'
    link.href = `#${rota.caminho}`
    link.textContent = rota.titulo
    if (rota === rotaAtual) link.setAttribute('aria-current', 'page')
    navbar.append(link)
  })
}
