# Agenda Escolar

Aplicacao web para uma escolinha cadastrar eventos, alunos, turmas e avisos.

## Tecnologias

- React: cria as telas e componentes.
- Vite: roda e gera a versao de publicacao.
- Supabase: banco de dados online.
- Vercel: hospedagem gratuita do front-end.

## Como rodar localmente

```bash
npm.cmd install
npm.cmd run dev
```

Abra `http://localhost:5173`.

## Como ligar no Supabase

1. Crie um projeto em `https://supabase.com`.
2. Abra `SQL Editor`.
3. Cole e execute o conteudo de `supabase-schema.sql`.
4. Copie `.env.example` para `.env.local`.
5. Preencha:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel-ou-anon
```

6. Reinicie o servidor local com `npm.cmd run dev`.

Sem `.env.local`, o app usa modo local no navegador. Com `.env.local`, ele usa o banco online.

## Onde alterar

- `src/App.jsx`: telas, formularios e fluxo da aplicacao.
- `src/styles.css`: cores, layout, fontes, espacamentos e responsividade.
- `src/services/agendaRepository.js`: funcoes que leem e gravam dados.
- `src/lib/supabase.js`: conexao com o Supabase.
- `supabase-schema.sql`: estrutura do banco e permissoes.

## Como publicar na Vercel

1. Suba o projeto para um repositorio no GitHub.
2. Crie uma conta em `https://vercel.com`.
3. Importe o repositorio.
4. Configure as variaveis de ambiente na Vercel:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

5. Use as configuracoes padrao:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Observacao de seguranca

O SQL atual libera cadastro e exclusao de dados pelo site para facilitar a demonstracao do projeto. Para uso real em uma escola, o proximo passo recomendado e adicionar login com Supabase Auth e regras separando professoras, responsaveis e administracao.
