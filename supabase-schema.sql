-- Execute este SQL UMA VEZ no Supabase > SQL Editor.
-- Ele adiciona suporte a opções/subprodutos dentro de cada produto.
-- Ex.: Caipiroska Tropical -> Abacaxi, Kiwi, Maracujá, Morango.

alter table public.products
add column if not exists options jsonb not null default '[]'::jsonb;

-- Se sua tabela products usa RLS, mantenha suas políticas atuais.
-- O painel usa o usuário autenticado do Supabase para inserir/editar produtos.
