# Kattamaram II — Cardápio + Painel Administrativo

## Versão multilíngue
- Cardápio público com seletor de idioma no topo: PT-BR, ENGLISH e ESPAÑOL.
- O idioma escolhido fica salvo no navegador e permanece selecionado quando o cliente volta ao cardápio.
- Textos da interface, títulos, opções e mensagens são traduzidos automaticamente.
- Produtos e categorias possuem campos de tradução no painel administrativo.
- Opções/subprodutos também podem ter nome e descrição em inglês e espanhol.
- Se uma tradução não estiver preenchida, o sistema usa o texto em PT-BR como fallback.
- Preços continuam em reais (R$), independentemente do idioma.

## Importante — banco de dados
Antes de publicar a nova versão, execute uma vez o conteúdo de `supabase-schema.sql` no Supabase > SQL Editor.

A atualização adiciona:
- `products.translations` (jsonb)
- `categories.translations` (jsonb)
- mantém `products.options` (jsonb)

Depois disso, no painel administrativo, edite os produtos/categorias e preencha as traduções.

## Como o cliente troca o idioma
No topo do cardápio, basta clicar em `PT-BR` e escolher:
- 🇧🇷 PT-BR
- 🇺🇸 ENGLISH
- 🇪🇸 ESPAÑOL

A troca acontece na mesma página, sem precisar abrir outro cardápio.

## Supabase
Confira `supabase-config.js` antes de publicar. O painel administrativo continua usando o usuário autorizado existente.


## Tradução automática ao cadastrar

A partir desta versão, ao salvar uma nova categoria ou produto, o painel traduz automaticamente os campos em português para **English** e **Español** e grava as traduções no Supabase. Isso inclui nome e descrição do produto, nome da categoria e nome/descrição de todas as opções/subprodutos. Se um produto existente tiver seu texto em PT-BR alterado, a tradução automática é atualizada quando a tradução anterior ainda era a tradução automática. Traduções preenchidas manualmente são preservadas.
