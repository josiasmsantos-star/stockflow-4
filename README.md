# StockFlow – Demo estática para Netlify

Sistema web de controle de estoque com visual original preservado e versão adaptada para publicação estática no Netlify.

## Estrutura da pasta

- `index.html`: tela de login.
- `dashboard.html`: página principal com indicadores do estoque.
- `produtos.html`: listagem de produtos e pesquisa.
- `cadastro.html`: cadastro e edição de produtos.
- `movimentacao.html`: registro de entradas e saídas.
- `css/`: arquivos de estilo.
- `js/`: scripts JavaScript da interface.
- `README.md`: instruções do projeto.

## Como funciona esta versão

Esta versão foi adaptada para funcionar como site estático, sem PHP, sem MySQL, sem XAMPP e sem banco de dados local.

Os dados são armazenados no navegador com `localStorage`, o que permite que a demo funcione normalmente em produção no Netlify.

## Usuário demo

- E-mail: `admin@stockflow.com`
- Senha: `admin123`

## Como abrir localmente

Você pode abrir a pasta diretamente no navegador ou colocar a pasta dentro do XAMPP apenas para teste local. Mas esta versão não depende do XAMPP para funcionar.

## Como publicar no Netlify

1. Faça upload da pasta inteira do projeto no Netlify.
2. Selecione a pasta contendo `index.html`.
3. Publique o site.
4. O Netlify abrirá automaticamente a página inicial.

## Observações importantes

- Não há backend.
- Não há banco de dados.
- Não há conexão com servidor local.
- Os dados ficam salvos no navegador do usuário.

## Objetivo desta versão

Manter o visual original do projeto e preservar a navegação e a interface, enquanto elimina dependências de servidor para permitir publicação estática em plataformas como Netlify.
