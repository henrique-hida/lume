import { renderizarInicio } from '../paginas/inicio/inicio.js'
import { renderizarResultados } from '../paginas/resultados/resultados.js'
import { renderizarDetalhe } from '../paginas/detalhe/detalhe.js'
import { renderizarFavoritos } from '../paginas/favoritos/favoritos.js'
import { renderizarSobre } from '../paginas/sobre/sobre.js'

export const rotas = [
  { caminho: '/inicio', titulo: 'Início', menu: true, renderizar: renderizarInicio },
  { caminho: '/resultados', titulo: 'Resultados', renderizar: renderizarResultados },
  { caminho: '/detalhe/:id', titulo: 'Detalhe', renderizar: renderizarDetalhe },
  { caminho: '/favoritos', titulo: 'Favoritos', menu: true, renderizar: renderizarFavoritos },
  { caminho: '/sobre', titulo: 'Sobre', menu: true, renderizar: renderizarSobre },
]

export function encontrarRota(caminho) {
  const segmentos = caminho.split('/')
  return rotas.find((rota) => {
    const partes = rota.caminho.split('/')
    return partes.length === segmentos.length && partes.every((parte, indice) =>
      parte.startsWith(':') ? Boolean(segmentos[indice]) : parte === segmentos[indice],
    )
  })
}
