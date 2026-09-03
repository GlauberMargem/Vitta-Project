# Arquitetura

## Camadas

1. **Apresentação** — navegador/webapp, paciente e médico, mesma aplicação Next.js
   com rotas/dashboards diferentes por `role`.
2. **Aplicação** — Next.js unifica frontend (React) e backend (API Routes/Route
   Handlers). Sem servidor separado.
3. **Dados e serviços** — PostgreSQL para persistência; serviço externo de
   autenticação (NextAuth/OAuth); notificações push (fora do MVP inicial).

## Stack e por quê

| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | Next.js (App Router) | SSR, API Routes integradas, deploy simples no Vercel |
| UI | React + Tailwind CSS | componentização + mobile-first sem overhead de CSS custom |
| Linguagem | TypeScript | tipagem estática em dados de saúde reduz risco de erro silencioso |
| Banco | PostgreSQL | integridade referencial, relacional, adequado a dados sensíveis |
| Auth | NextAuth/OAuth | evita implementar autenticação própria (risco de segurança) |
| Hospedagem | Vercel | integração nativa com Next.js |

## Convenções de projeto

- Rotas de API ficam em `src/app/api/**/route.ts`, uma responsabilidade por rota
  (ex.: `api/glucose-records`, `api/meals`, `api/patient-doctor-links`).
- Toda rota que lida com dados clínicos exige sessão autenticada (NextAuth) —
  nenhuma rota de dados de saúde é pública.
- Separação de camada de acesso a dados: queries/ORM ficam isoladas (ex.:
  `src/lib/db/*`), não misturadas com componentes React nem direto no handler.
- Componentes de UI genéricos (shadcn) ficam em `src/components/ui`; componentes de
  domínio (ex. `GlucoseChart`, `PatientCard`) ficam em `src/components/<domínio>`.

## Prisma 7 — driver adapter obrigatório

O gerador de client usado (`provider = "prisma-client"`, saída em
`src/generated/prisma`) não embute mais um query engine binário por padrão. O
`PrismaClient` exige um driver adapter explícito (ou uma URL do Prisma
Accelerate). Para PostgreSQL local, usamos `@prisma/adapter-pg` (baseado no
pacote `pg`). Ver `src/lib/db/client.ts` para o singleton configurado. Não
remover o adapter nem tentar instanciar `new PrismaClient()` sem argumentos —
isso não compila.

## Auth.js v5 — callbacks precisam de tipos explícitos

`declare module "next-auth/jwt"` (em `src/types/next-auth.d.ts`) adiciona `id` e
`role` ao tipo `JWT`, mas a inferência automática de parâmetros do callback
`session` não pega esse augmentation (o tipo do parâmetro vem de uma
interseção complexa em `@auth/core`, e a inferência contextual falha nesse
caso). Por isso os callbacks em `src/lib/auth/config.ts` anotam os parâmetros
explicitamente (`{ session, token }: { session: Session; token: JWT }`) em vez
de confiar na inferência. Se remover essas anotações, `token.id`/`token.role`
voltam a ser `unknown` e o build quebra.

## Middleware é `middleware.ts`, não `proxy.ts`

A skill `next-best-practices` (instalada via `npx skills add`) afirma que o
Next.js 16+ renomeou `middleware.ts` para `proxy.ts`. **Isso está errado para
a versão instalada neste projeto** (`next@16.1.1`): conferido direto em
`node_modules/next/dist/lib/constants.js`, a constante é
`MIDDLEWARE_FILENAME = 'middleware'` — não existe suporte a `proxy.ts` nesse
pacote. O arquivo certo é `middleware.ts` na raiz do projeto (o build
internamente rotula a feature como "Proxy (Middleware)" no output, então o
*conceito* mudou de nome, mas não o arquivo).

Isso é um lembrete de que conteúdo de skill de terceiros pode estar
desatualizado ou errado para a versão exata das dependências do projeto —
vale conferir contra o pacote instalado antes de aplicar, principalmente em
convenções que mudam entre versões.

## Middleware precisa de config separada do Auth.js (roda no Edge)

`middleware.ts` roda em Edge Runtime por padrão. A config completa do Auth.js
(`src/lib/auth/config.ts`) importa `src/lib/db/client.ts`, que usa `pg` — e
`pg` não roda no Edge (`Module not found: Can't resolve 'util/types'`).
Solução: a config foi dividida em duas.

- `src/lib/auth/config.base.ts` — só sessão/callbacks/páginas, **sem**
  providers, sem import de banco. Edge-safe. `trustHost: true` também está
  aqui (necessário pra rodar fora da Vercel sem erro `UntrustedHost`).
- `src/lib/auth/config.ts` — importa `config.base.ts` e adiciona o provider
  de credenciais (que usa Prisma/bcrypt). Usado em toda parte que não é
  Edge: route handler, server actions, server components.
- `middleware.ts` importa só `config.base.ts` e cria sua própria instância
  `NextAuth()` local — nunca importar `src/lib/auth/config.ts` (o completo)
  dentro de `middleware.ts`.

## ⚠️ `next dev` (Turbopack e Webpack) não executa `middleware.ts` nesta versão

Bug/limitação confirmada em `next@16.1.1`: o middleware é compilado e
aparece corretamente no manifest (`.next/dev/server/middleware-manifest.json`,
matchers certos), mas **não é invocado em nenhuma requisição** durante
`next dev` — nem com matcher amplo, nem com uma função que dá `throw`
incondicional. Testado nas duas opções de bundler (`--turbopack` e
`--webpack`), mesmo resultado.

Em produção (`next build && next start`) o middleware funciona
perfeitamente — testado ponta a ponta (bloqueia sem sessão, redireciona pra
`/login?callbackUrl=...`, libera com sessão válida).

**Implicação prática**: pra testar qualquer coisa que dependa do middleware
(guard de rota), rodar `npm run build && npm run start` em vez de `npm run
dev`. Isso deve ser revisto quando o Next.js for atualizado — pode ser que
uma versão mais nova corrija esse bug do dev server.

## Ícones: lucide-react, não Material Symbols

`Navbar`/`Header` usavam a fonte de ícones "Material Symbols Outlined" do
Google (via `<link>` manual no `layout.tsx`), resquício do bootstrap anterior
às specs. Corrigido: ícones trocados para `lucide-react` (já mandatado pelo
`CLAUDE.md`) e o `<link>` manual removido — carregar fonte via `<link>` em vez
de `next/font` bloqueia renderização e não é otimizado.

## Migração de JS → TS

O bootstrap atual (`src/app/*.js`, `src/components/**/*.jsx`) não é TypeScript.
Diretriz: todo arquivo novo já nasce `.ts`/`.tsx`; arquivos existentes migram
quando forem tocados por uma tarefa do roadmap (não é necessário um "big bang" de
migração antes de começar a implementar features).
