-- Execute este SQL UMA VEZ no Supabase > SQL Editor.
-- Suporte a opções/subprodutos e traduções PT-BR / English / Español.

alter table public.products
add column if not exists options jsonb not null default '[]'::jsonb;

alter table public.products
add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.categories
add column if not exists translations jsonb not null default '{}'::jsonb;

-- Estrutura esperada:
-- products.translations = {"en":{"name":"...","description":"..."},"es":{"name":"...","description":"..."}}
-- categories.translations = {"en":{"name":"..."},"es":{"name":"..."}}
-- options dentro de products podem ter o mesmo campo translations.

-- Se suas tabelas usam RLS, mantenha suas políticas atuais.
