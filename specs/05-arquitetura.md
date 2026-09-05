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
| Gráficos | Recharts (via shadcn/ui Charts) | ver seção dedicada abaixo |
| Relatório PDF | jsPDF + jspdf-autotable | ver seção dedicada abaixo |
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

## Gráficos: Recharts via shadcn/ui Charts

A monografia menciona "bibliotecas de gráficos" de forma genérica, sem
escolher uma — decisão tomada em 2026-09-03, com o Glauber. Opção cogitada:
Apache ECharts. Descartada porque é uma engine de canvas própria, API
imperativa, ~1MB de bundle — overhead desnecessário pro gráfico de área
simples do Sprint 3 (tendência semanal de glicemia, poucos pontos), e pesa
contra o RNF01 (resposta <2s em conexão móvel lenta).

Escolhido: **Recharts**, via os componentes de gráfico do shadcn/ui
(`npx shadcn add chart`). Motivos:
- SVG declarativo, componentes React normais — sem API imperativa separada.
- Já estilizado com as variáveis de cor do Tailwind/`08-design-system.md`,
  em vez de exigir um tema próprio.
- Consistente com o resto da UI (shadcn já usado em `Button`, `Input`,
  `Dialog`, `Select`).
- Bundle bem menor que ECharts.

## Sessão JWT não reflete edição de perfil até novo login

`src/lib/auth/config.base.ts` usa `session: { strategy: "jwt" }`. O token é
populado com `name`/`email` só no momento do login (quando o parâmetro
`user` chega no callback `jwt`); em requisições seguintes o callback reusa o
que já está no token, sem reconsultar o banco. Consequência prática: depois
que o usuário edita nome/email em `/userConfig`
(`src/lib/profile/actions.ts`), o dado já está correto no banco e na própria
tela de perfil (que lê direto do Prisma), mas o nome exibido no cabeçalho/
saudação (que vem de `session.user.name`) só atualiza depois de sair e
entrar de novo. Não implementei correção (exigiria reconsultar o banco a
cada request, ou adicionar `SessionProvider` + `update()` no client, que o
app não usa hoje) — é uma limitação conhecida, não um bug a caçar.

## Relatório em PDF (RF08) gerado 100% no navegador

Decisão tomada com o Glauber em 2026-09-05. Opções cogitadas: Puppeteer/
Playwright (renderiza HTML real em PDF via Chromium headless) e
`@react-pdf/renderer` (componentes React com motor de layout próprio).

Descartado Puppeteer: precisa de um binário Chromium rodando no servidor —
em serverless (Vercel, hospedagem alvo do projeto) isso exige pacotes extras
(`@sparticuz/chromium` ou similar), aumenta o tempo de cold start e o
tamanho do deploy, pra um relatório que é só texto/tabela, sem necessidade
de renderizar HTML/CSS complexo.

Escolhido: **jsPDF** + **jspdf-autotable**. Motivos:
- Gera o PDF inteiramente no navegador (`RelatorioPdfButton.tsx`, client
  component) — nenhuma rota de servidor nova, nenhum custo de
  servidor/Chromium.
- `jspdf-autotable` é o plugin padrão de facto pra tabelas no jsPDF (cabeçalho,
  paginação automática se a tabela for grande) — evita desenhar células à mão.
- As duas bibliotecas são importadas via `import()` dinâmico dentro do
  handler de clique, não no carregamento inicial da página — mantém o
  bundle inicial leve (RNF01).

## Alteração de senha exige a senha atual

`changePassword` (`src/lib/profile/actions.ts`) exige a senha atual antes de
gravar a nova (`bcrypt.compare` contra o hash salvo) — mesmo com sessão
autenticada. Decisão de segurança: sem essa checagem, qualquer sessão
comprometida (ex.: dispositivo destravado) poderia trocar a senha e travar o
dono da conta fora.

## Login social Google — não implementado, gap de design identificado

`CLAUDE.md` e o mockup de login (`08-design-system.md`) preveem um botão de
login com Google, hoje renderizado desabilitado. Investigado em 2026-09-05:
não é só uma questão de configurar credenciais — falta resolver um problema
de fluxo antes de implementar. Decisão do Glauber: documentar o que falta,
não implementar agora.

**O gap**: o cadastro atual (`CadastroForm.tsx`) exige escolher o perfil
(paciente/médico) e preencher dados específicos de cada um (data de
nascimento + tipo de diabetes, ou CRM + especialidade) antes de criar a
conta — `PatientProfile`/`DoctorProfile` são obrigatórios e 1:1 com `User`.
O provider do Google só devolve nome e email; não há como saber o `role`
nem os dados do perfil a partir disso. Uma conta criada via Google precisa
de uma tela de onboarding pós-login pra completar esses dados — essa tela
nunca foi desenhada em nenhum mockup ou spec, e inventar esse fluxo sem
confirmar com o Glauber violaria a diretriz de não inventar comportamento
não especificado.

**O que falta definir antes de implementar** (perguntar ao Glauber quando
for retomar):
- Como fica a tela de "complete seu cadastro" depois do primeiro login via
  Google (campos, textos, layout).
- O que acontece se o email do Google já existir como conta de
  email/senha — vincula automaticamente, ou bloqueia com um aviso?

**O que já se sabe tecnicamente** (não é o bloqueio):
- Auth.js v5 detecta credenciais automaticamente via variáveis de ambiente
  `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` — bastaria adicionar
  `Google()` (import de `next-auth/providers/google`) à lista de
  `providers` em `src/lib/auth/config.ts` (nunca em `config.base.ts`, que é
  Edge-safe e não deve ganhar peso extra).
- Client ID/Secret são gerados no
  [Google Cloud Console](https://console.cloud.google.com/), em "APIs e
  Serviços" → "Credenciais" → "Criar credenciais" → "ID do cliente OAuth",
  tipo "Aplicativo da Web", com a URI de redirecionamento
  `<URL_DO_APP>/api/auth/callback/google` (em produção na Vercel, a URL
  real do deploy; em desenvolvimento local,
  `http://localhost:3000/api/auth/callback/google`).
- Mesmo com credenciais reais, esse fluxo não é testável por
  curl/simulação de formulário (o padrão usado em todo o resto do projeto)
  — o OAuth do Google exige um redirecionamento de navegador real pra
  `accounts.google.com` e de volta. Testar exige um navegador de verdade e
  uma conta Google real.

## Migração de JS → TS

O bootstrap atual (`src/app/*.js`, `src/components/**/*.jsx`) não é TypeScript.
Diretriz: todo arquivo novo já nasce `.ts`/`.tsx`; arquivos existentes migram
quando forem tocados por uma tarefa do roadmap (não é necessário um "big bang" de
migração antes de começar a implementar features).
