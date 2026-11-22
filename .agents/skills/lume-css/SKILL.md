---
name: lume-css
description: Criar ou revisar CSS e componentes visuais do Lume seguindo os padrões do projeto e as restrições de layout da prova.
---

# CSS e componentes

Use classes BEM, estilos por tela e componentes reutilizáveis. Siga os requisitos do Lume: cores apenas em `src/css/tokens.css`, layout em Flexbox, sem `display: grid`, frameworks CSS ou JavaScript, e sem largura ou altura fixa em filhos flex. Verifique o resultado a 360 px sem rolagem lateral.

Exemplo de organização, com tokens ilustrativos a definir no projeto:

```css
/* tokens.css */
:root {
  --cor-texto: #242424;
  --cor-superficie: #ffffff;
  --espaco-medio: 1rem;
}
```

```css
/* paginas/inicio/inicio.css */
.inicio {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-medio);
  color: var(--cor-texto);
  background: var(--cor-superficie);
}

.inicio__formulario {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-medio);
  min-width: 0;
}
```

Os nomes e valores são exemplos, não uma identidade visual aprovada. Prefira medidas flexíveis e regras globais compartilhadas; deixe o CSS específico ao lado da tela ou componente. Preserve semântica, rótulos, foco visível e estados legíveis. Teste a tela e suas interações no navegador; não apresente leitura de CSS como validação visual.
