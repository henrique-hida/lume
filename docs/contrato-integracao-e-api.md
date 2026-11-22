# Contrato de Integração e Documentação da API (Open Library)

Documento de referência técnica para alinhar os contratos entre **Henrique**, **Matheus** e **Enzo** e servir de base para a **Seção 3 do Google Docs** (responsabilidade do Matheus).

---

## 1. Contratos de Integração da Equipe

### 1.1. Rotas do Aplicativo (alinhamento com Henrique)

| Tela | Padrão de Hash | Exemplo | Responsável | Observações |
| --- | --- | --- | --- | --- |
| Início | `#/inicio` | `#/inicio` | Henrique | Redireciona busca para `#/resultados?assunto=...` |
| Resultados | `#/resultados?assunto=<termo>` | `#/resultados?assunto=fantasia` | Matheus | Lê `assunto` da query string do hash |
| Detalhe | `#/detalhe/<id>` | `#/detalhe/OL29226517W` | Matheus | `<id>` é o código limpo da obra (`OL...W`), funcionando após F5 |
| Favoritos | `#/favoritos` | `#/favoritos` | Enzo | Lista itens salvos no Capacitor Preferences |
| Sobre | `#/sobre` | `#/sobre` | Enzo | Exibe origem (Open Library), link e horário da última atualização |
| Rota inexistente | Qualquer hash não reconhecido | `#/xyz` | Henrique | Oferece link/botão de saída para `#/inicio` |

### 1.2. Formato Interno de um Livro (`LivroResumo` e `LivroDetalhe`)

Nenhum campo em inglês da Open Library (`title`, `author_name`, `first_publish_year`, `cover_i`, `description`) chega às telas ou aos favoritos. O serviço `src/js/servicos/api.js` entrega sempre objetos nos formatos abaixo:

#### `LivroResumo` (usado em Resultados, Cache de busca e Favoritos)
```js
{
  id: 'OL29226517W',                                        // string (sem "/works/")
  titulo: 'Fourth Wing',                                    // string
  autores: ['Rebecca Yarros'],                              // string[] (pode ser [] se ausente)
  anoPublicacao: 2023,                                      // number | null
  capaUrl: 'https://covers.openlibrary.org/b/id/14407898-M.jpg', // string | null
  assuntos: ['Fantasía', 'Fantasy', 'Fiction'],             // string[]
  numeroEdicoes: 15                                         // number
}
```

#### `LivroDetalhe` (usado na tela de Detalhe — estende `LivroResumo`)
```js
{
  id: 'OL29226517W',
  titulo: 'Fourth Wing',
  autores: ['Rebecca Yarros'],
  anoPublicacao: 2023,
  capaUrl: 'https://covers.openlibrary.org/b/id/14407898-L.jpg', // string | null (tamanho L)
  assuntos: ['Fantasía', 'Fantasy', 'Fiction'],
  numeroEdicoes: 15,
  sinopse: 'Twenty-year-old Violet Sorrengail...',          // string | null
  linksExternos: [                                          // Array<{ titulo: string, url: string }>
    { titulo: 'Fourth wing PDF', url: 'https://...' }
  ],
  urlOrigem: 'https://openlibrary.org/works/OL29226517W'    // string
}
```

### 1.3. Assinaturas do Serviço de API (`src/js/servicos/api.js` — Matheus)

```js
// Busca lista de livros por assunto
// Retorna: Promise<{ assunto: string, totalEncontrados: number, livros: LivroResumo[] }>
buscarLivrosPorAssunto(assunto, { limite = 20, pagina = 1 } = {})

// Busca detalhe de um livro pelo ID da rota (inclusive após F5)
// Retorna: Promise<LivroDetalhe>
buscarLivroPorId(id)

// Constantes de tipos de erro lançados por ErroApi (erro.tipo e erro.semInternet)
TIPOS_ERRO_API = {
  SEM_INTERNET: 'SEM_INTERNET',
  NAO_ENCONTRADO: 'NAO_ENCONTRADO',
  LIMITE_EXCEDIDO: 'LIMITE_EXCEDIDO',
  ERRO_HTTP: 'ERRO_HTTP',
  PARAMETRO_INVALIDO: 'PARAMETRO_INVALIDO',
}
```

### 1.4. Sugestão de Contrato para Cache e Favoritos (alinhamento com Enzo)

Para que as telas de **Resultados**, **Detalhe**, **Favoritos** e **Sobre** conversem sem acoplamento:

```js
// Sugestão para src/js/servicos/cache.js (Enzo)
// Salva a última resposta convertida de uma chave de busca (ex.: assunto normalizado em minúsculas)
salvarCacheBusca(chaveBusca, dados) // grava { dados, atualizadoEm: '14h32', timestamp: Date.now() }
lerCacheBusca(chaveBusca)           // retorna { dados, atualizadoEm, timestamp } | null
obterUltimaAtualizacaoGlobal()      // retorna string de horário (ex.: '14h32') | null para a tela Sobre

// Sugestão para src/js/servicos/favoritos.js (Enzo — Capacitor Preferences)
listarFavoritos()                   // Promise<LivroResumo[]>
ehFavorito(id)                      // Promise<boolean>
salvarFavorito(livroResumo)         // Promise<void>
removerFavorito(id)                 // Promise<void>
alternarFavorito(livroResumo)       // Promise<boolean> (retorna true se ficou salvo, false se removido)
```

---

## 2. Conteúdo para a Seção 3 do Google Docs (Responsabilidade: Matheus)

> **Atenção:** Copie e adapte os blocos abaixo diretamente na sua conta Google no documento oficial compartilhado pelo professor. Lembre-se de que código e JSON no Docs devem ser inseridos como **texto em bloco de código**, nunca como print.

### 3.1. Endereços (Endpoints) Utilizados

A API utilizada é a **Open Library API** (`https://openlibrary.org`), pública e aberta, sem necessidade de chave de autenticação (atendendo ao requisito **A5**).

1. **Busca de livros por assunto (`GET`):**
   ```text
   https://openlibrary.org/search.json?subject={assunto}&limit=20&page=1&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count
   ```
   - **Por que `search.json?subject=...` em vez de `/subjects/{slug}.json`?** O endpoint `/subjects/{slug}.json` exige um identificador exato em inglês sem espaços, enquanto `search.json?subject={assunto}` aceita termos compostos e assuntos em português ou inglês (ex.: `fantasia`, `historia`, `ficcao cientifica`), além de permitir filtrar os campos retornados pelo parâmetro `fields` para reduzir o tráfego de rede.

2. **Detalhe de uma obra por ID (`GET`):**
   ```text
   https://openlibrary.org/works/{id}.json
   ```
   - Exemplo: `https://openlibrary.org/works/OL29226517W.json`.
   - Para garantir que a tela de Detalhe exiba também o nome dos autores e o ano de publicação mesmo quando acessada diretamente via URL ou após recarregar a página (**F5** em `#/detalhe/OL29226517W`), o serviço `api.js` realiza em paralelo a consulta leve de metadados `https://openlibrary.org/search.json?q=key:/works/{id}&limit=1&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count`, pois `/works/{id}.json` retorna apenas o identificador do autor (`/authors/OL7825177A`) sem o nome textual.

3. **Imagens de capa (Open Library Covers):**
   ```text
   https://covers.openlibrary.org/b/id/{cover_i}-{tamanho}.jpg
   ```
   - Onde `{tamanho}` é `M` (médio, para a lista de resultados) ou `L` (grande, para a tela de detalhe).

### 3.2. Exemplo Resumido da Resposta da API (em texto)

**Resposta de `GET https://openlibrary.org/search.json?subject=fantasia&limit=2&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count`:**

```json
{
  "numFound": 193,
  "start": 0,
  "numFoundExact": true,
  "q": "subject:fantasia",
  "docs": [
    {
      "author_name": ["Rebecca Yarros"],
      "cover_i": 14407898,
      "edition_count": 15,
      "first_publish_year": 2023,
      "key": "/works/OL29226517W",
      "title": "Fourth Wing",
      "subject": ["Fantasía", "Fantasy", "Fiction", "Romance"]
    }
  ]
}
```

**Resposta de `GET https://openlibrary.org/works/OL29226517W.json` (resumida):**

```json
{
  "key": "/works/OL29226517W",
  "title": "Fourth Wing",
  "authors": [
    {
      "author": { "key": "/authors/OL7825177A" },
      "type": { "key": "/type/author_role" }
    }
  ],
  "description": {
    "type": "/type/text",
    "value": "Twenty-year-old Violet Sorrengail was supposed to enter the Scribe Quadrant..."
  },
  "subjects": ["Fantasía", "Fantasy", "Fiction", "Romance"],
  "covers": [14407898]
}
```

### 3.3. Função de Conversão para o Formato do App

Em `src/js/servicos/api.js`, as funções `converterLivroBusca` e `converterLivroDetalhe` traduzem os campos da Open Library para o formato interno do aplicativo antes de entregá-los às telas, tratando campos ausentes e variações de tipo (como `description`, que na Open Library pode ser uma `string`, um objeto `{ type, value }` ou `undefined`):

```js
export function extrairIdObra(chaveOuId) {
  if (typeof chaveOuId !== 'string') return ''
  return chaveOuId
    .trim()
    .replace(/^\/+/, '')
    .replace(/^works\//i, '')
    .replace(/\.json$/i, '')
    .trim()
}

export function extrairSinopse(description) {
  if (!description) return null
  if (typeof description === 'string') {
    return description.trim() || null
  }
  if (typeof description === 'object' && typeof description.value === 'string') {
    return description.value.trim() || null
  }
  return null
}

export function converterLivroBusca(registro) {
  return {
    id: extrairIdObra(registro?.key ?? ''),
    titulo: registro?.title?.trim() || 'Título não disponível',
    autores: Array.isArray(registro?.author_name) ? registro.author_name : [],
    anoPublicacao: Number.isInteger(registro?.first_publish_year)
      ? registro.first_publish_year
      : null,
    capaUrl: montarUrlCapa(registro?.cover_i, 'M'),
    assuntos: Array.isArray(registro?.subject) ? registro.subject.slice(0, 8) : [],
    numeroEdicoes: Number.isInteger(registro?.edition_count) ? registro.edition_count : 0,
  }
}
```

### 3.4. Limites da API e Comportamento em Caso de Falha

Conforme verificado na documentação oficial da Open Library e em testes HTTP diretos:

- **Limites de chamadas (Rate Limiting):** A Open Library não publica uma cota fixa rígida por minuto com chave de API, mas aplica **limitação dinâmica por comportamento e IP** para proteger sua infraestrutura pública. Rajadas excessivas de requisições ou raspagem contínua podem resultar em bloqueio temporário com status HTTP `403 Forbidden` ou `429 Too Many Requests`. Para minimizar chamadas e respeitar as boas práticas recomendadas pela Open Library:
  1. Utilizamos o parâmetro `fields` e `limit=20` em `search.json` para buscar múltiplos resultados em uma única requisição leve.
  2. Armazenamos a última resposta de cada busca em cache local (`servicos/cache.js`).
- **CORS em navegadores e WebView (Capacitor):** Os endpoints testados retornam `Access-Control-Allow-Origin: *` e permitem os cabeçalhos `Accept, Accept-Language, Content-Language, Content-Type`. Por isso, `api.js` envia apenas `Accept: application/json`, evitando cabeçalhos customizados que causariam falha de preflight CORS no navegador.
- **Comportamento na falha:**
  - **Assunto sem resultados:** Retorna status `200 OK` com `"numFound": 0` e `"docs": []`. O app identifica a lista vazia e exibe o estado **Vazio**.
  - **ID de obra inexistente (`/works/OL0000000W.json`):** Retorna status `404 Not Found` com `{"error": "notfound", "key": "/works/OL0000000W"}`. Como `fetch` não lança exceção sozinho em status 404/500, `api.js` verifica `!resposta.ok` e lança um `ErroApi` tipado (`NAO_ENCONTRADO`).
  - **Erro de servidor ou bloqueio (`403`, `429`, `500+`):** `api.js` captura o status via `!resposta.ok` e lança `ErroApi` (`LIMITE_EXCEDIDO` ou `ERRO_HTTP`), permitindo que a tela exiba a mensagem de erro com o botão **"Tentar de novo"**.
  - **Ausência de internet (Modo Avião / falha de rede):** Quando `navigator.onLine === false` ou `fetch` lança `TypeError` de rede, `api.js` lança `ErroApi` com `tipo: 'SEM_INTERNET'` (`semInternet: true`), acionando a leitura do cache local com aviso de horário ou a tela de ausência de internet.

---

## 3. Como executar os testes no Postman e gerar o print da E1

1. Abra o **Postman**.
2. Clique em **Import** e selecione o arquivo `docs/postman/lume-openlibrary.postman_collection.json`.
3. Abra a coleção **"Lume — Open Library API (E1 e Testes de Falha)"**.
4. Selecione a requisição **`1. Busca por assunto (Sucesso - E1 Print)`** e clique em **Send**.
5. Verifique a resposta JSON (`200 OK`) e a aba **Test Results (3/3)** aprovada.
6. Tire o print mostrando a URL da requisição, o status `200 OK` e o corpo da resposta JSON no Postman para inserir no Google Docs da **E1**.
