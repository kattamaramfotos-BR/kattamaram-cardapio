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

-- Permissão do painel administrativo
-- O painel já restringe o acesso ao e-mail do administrador no admin.js.
-- Esta policy permite ao usuário autenticado do painel editar, ativar/desativar,
-- inserir e excluir produtos e categorias sem alterar as policies públicas existentes.

drop policy if exists "Kattamaram admin products" on public.products;
create policy "Kattamaram admin products"
on public.products
for all
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'kattamaramfotos@gmail.com')
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'kattamaramfotos@gmail.com');

drop policy if exists "Kattamaram admin categories" on public.categories;
create policy "Kattamaram admin categories"
on public.categories
for all
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'kattamaramfotos@gmail.com')
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'kattamaramfotos@gmail.com');
