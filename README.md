# Kattamaram — Controle de Estoque

Sistema inicial para controlar mercadorias que chegam no Container e depois são transferidas para o Kattamaram II.

## Fluxo
Entrada manual ou nota fiscal → Container → Transferência → Kattamaram II.

## Requisitos
- Node.js 18.14+ (recomendado LTS)
- Conta/projeto no Supabase
- GitHub para versionamento
- Netlify para publicação

## Instalação local

```bash
npm install
cp .env.example .env
```

Preencha `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Depois:

```bash
npm run dev
```

## Banco
Abra o SQL Editor do Supabase e execute:

`supabase/schema.sql`

O SQL cria tabelas, índices, funções de transferência/entrada, triggers e políticas básicas.

## Deploy no Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Cadastre no Netlify as mesmas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Nota fiscal por IA
A tela de nota fiscal está preparada para receber a imagem/PDF e armazenar o arquivo no Supabase Storage. A extração por IA deve ser feita posteriormente por uma função server-side/Edge Function, nunca colocando uma chave secreta de IA no frontend.

## Observação de segurança
Esta versão não possui login, conforme solicitado. As políticas do banco são configuradas para o cenário sem autenticação. Antes de colocar dados reais em produção, é recomendável adicionar autenticação/usuários e restringir as operações de escrita.
