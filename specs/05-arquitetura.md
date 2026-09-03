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

## Migração de JS → TS

O bootstrap atual (`src/app/*.js`, `src/components/**/*.jsx`) não é TypeScript.
Diretriz: todo arquivo novo já nasce `.ts`/`.tsx`; arquivos existentes migram
quando forem tocados por uma tarefa do roadmap (não é necessário um "big bang" de
migração antes de começar a implementar features).
