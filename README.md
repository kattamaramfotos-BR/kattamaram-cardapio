# Kattamaram II — Cardápio + Painel Administrativo

## Ajustes desta versão
- O painel administrativo usa o usuário Supabase existente `kattamaramfotos@gmail.com`.
- O login valida o e-mail autorizado antes de abrir o painel.
- Usuários autenticados com outro e-mail são desconectados e recebem acesso negado.
- Corrigidos os IDs entre `index.html`, `app.js` e `style.css` para o cardápio público.
- Corrigido o modal de produto e suporte às opções/subprodutos.

## Antes de publicar
Confira `supabase-config.js` e mantenha nele a URL do projeto e a chave anon/publishable do seu Supabase.

## Supabase
O usuário administrador deve existir no Supabase Auth e estar confirmado. Nesta versão o e-mail autorizado no código é `kattamaramfotos@gmail.com`.
