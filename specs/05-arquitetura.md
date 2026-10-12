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

> Atualização 2026-10-12: Next subiu pra `16.4.0` (falhas de segurança do
> `npm audit`, incluindo execução remota de código e CSRF em Server
> Actions). Em `build && start` o middleware continua bloqueando
> `/dashboard`, `/userConfig` e `/dashboard/pacientes/*` sem sessão
> (redirect 307 pra `/login`). O comportamento no `next dev` ainda não foi
> retestado nessa versão.

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

### Suspeita de bug parecido com `import()` dinâmico (RF08, não confirmado)

O Glauber relatou em 2026-10-12 que o botão "Baixar relatório" trava em
"Gerando..." pra sempre (nunca baixa, nenhum erro visível) — ele estava
testando com `npm run dev`. Investiguei bastante tentando reproduzir:

- Rodei a mesma chamada de `jsPDF`/`jspdf-autotable` do componente
  isoladamente em Node — gera o PDF sem erro.
- Comparei o código compilado (`.next/static/chunks`) com o código-fonte —
  bate exatamente.
- Confirmei que todos os chunks dinâmicos (`import("jspdf")`,
  `import("jspdf-autotable")`) respondem HTTP 200 depois de
  `npm run build && npm run start`.
- Não achei header de CSP nem nada bloqueando `blob:`/download.

Ou seja: com build de produção, não consegui reproduzir nenhum problema —
só não dá pra confirmar o clique de verdade sem navegador (ver limitação
de teste no topo deste documento). A suspeita forte é que seja **outra
limitação do `next dev`/Turbopack nesta versão**, no mesmo espírito do bug
do middleware acima — `import()` dinâmico de uma biblioteca grande
(jsPDF + autotable) compilando sob demanda no dev server, talvez nunca
resolvendo a Promise. **Ainda não confirmado com o Glauber testando via
`npm run build && npm run start`** — atualizar esta nota depois que ele
testar.

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

## Login social Google — implementado (2026-10-10)

Era um gap de design documentado desde 2026-09-05 (botão desabilitado): o
Google só devolve nome e email, mas o cadastro exige escolher perfil
(paciente/médico) + dados específicos antes de criar a conta, e nunca
existiu uma tela pra completar isso depois do login social. Decisões
confirmadas com o Glauber antes de implementar:
- O Google só traz nome/email; o resto (perfil + dados específicos) é o
  mesmo formulário da etapa 2 do cadastro manual.
- ~~Se o email do Google já tiver conta por senha, vincula
  automaticamente.~~ **Revogado em 2026-10-12** (auditoria de segurança,
  confirmado com o Glauber): ver "Sem vínculo automático com conta por
  senha" abaixo.

### Sem vínculo automático com conta por senha (2026-10-12)

O cadastro por senha não confirma o email. Com o vínculo automático, um
atacante podia criar uma conta com o email de outra pessoa (ou trocar o
email da própria conta para o dela) e esperar: quando a vítima entrasse
com o Google, cairia dentro da conta do atacante, que continua sabendo a
senha e lê os dados de saúde dela (pré-sequestro de conta).

Correção:
- Callback `signIn` (`src/lib/auth/config.ts`): se já existe `User` com
  esse email **e com `passwordHash`**, recusa o login Google e redireciona
  pra `/login?erro=conta-com-senha`, que mostra "Já existe uma conta com
  esse email criada com senha. Entre com seu email e senha."
- `updateBasicInfo` (`src/lib/profile/actions.ts`): conta sem senha
  (criada pelo Google) não pode trocar o email, porque o email dela é o
  que o Google confirmou. Na tela de Perfil o campo fica somente leitura
  com uma explicação. Sem isso, um atacante com conta Google podia trocar
  o email para o da vítima e a sessão JWT antiga dele continuaria valendo
  na conta onde a vítima passaria a entrar.

Vincular os dois meios de login numa mesma conta, se um dia for preciso,
exige confirmar o email no cadastro por senha antes (funcionalidade nova,
fora do escopo atual).

### Por que não foi só adicionar o provider

O projeto não usa Adapter do Prisma com o NextAuth — sessão é só JWT, e o
`Credentials` provider faz o lookup manual no banco dentro de
`authorize()`. Login Google não tem um "authorize" equivalente; o único
callback com acesso ao perfil do Google E ao banco ao mesmo tempo é o
`jwt`, em `src/lib/auth/config.ts` (não em `config.base.ts`, que é
Edge-safe e não importa `db`).

`User.role` era obrigatório no schema, mas um login Google novo não tem
perfil ainda — solução: `role` virou opcional (`Role?`, migration
`20261010203648_make_user_role_optional`), e `role: null` significa
"cadastro pendente". Na primeira vez que alguém entra com Google, já cria
um `User` (nome/email do Google, sem senha, `role: null`) — e só marca o
`role` quando a pessoa completa a etapa que falta. Essa escolha evita
mexer no tipo de `session.user.id` (que seria um blast radius bem maior —
toda ação de paciente/médico assume que `id` é sempre uma string válida);
só `session.user.role`/`JWT.role` viraram `Role | null`.

⚠️ **Pegadinha de tipos encontrada na implementação**: a interface
`User` do módulo `next-auth` (usada no retorno de `authorize()`) é
intersectada DENTRO de `Session.user` via `DefaultSession["user"]`. Se
`User.role` ficasse `Role` (não-nulo) enquanto `Session.user.role` fosse
declarado como `Role | null`, a interseção colapsava `role` de volta pra
não-nulo (`Role & (Role | null)` = `Role`), e o erro de tipo aparecia num
lugar sem relação nenhuma com a causa real. Correção:
`interface User { role: Role | null }` também — ver comentário em
`src/types/next-auth.d.ts`.

### Fluxo implementado

- `src/lib/auth/config.ts`: provider `Google` adicionado; novo callback
  `signIn` rejeita (`return false`) se `profile.email_verified !== true`
  (não aceita email que o Google não confirmou — proteção contra alguém
  reivindicar um email que não é dele); callback `jwt` estendido —
  pra login Google, busca `User` pelo email (conta Google já existente ou
  retomada de cadastro pendente; conta com senha já foi barrada no
  `signIn`) ou cria um `User` novo com `role: null`.
- `src/lib/auth/config.base.ts` (Edge-safe, usado pelo `middleware.ts`):
  callback `authorized` agora redireciona pra `/cadastro/completar`
  (via `NextResponse.redirect`, que o tipo de retorno do `authorized` do
  Auth.js v5 aceita diretamente) quando `auth.user.role` é `null`, nas
  rotas protegidas.
- `src/app/cadastro/completar/` (nova tela, fora do grupo `(app)`, mesmo
  estilo visual de login/cadastro): mostra nome/email do Google (só
  leitura) + o mesmo formulário da etapa 2 do cadastro (seletor
  Paciente/Médico + campos específicos, sem senha). Server action
  `completeGoogleSignup` (`src/lib/auth/actions.ts`) atualiza o `User`
  pendente com o `role`/perfil escolhidos, depois chama
  `signIn("google", { redirectTo: "/dashboard" })` de novo — o Google já
  tem o consentimento, então é só um redirecionamento rápido de ida e
  volta (sem tela de novo), necessário pra sessão pegar o `role` recém
  salvo (o JWT antigo em cache ainda tinha `role: null`). Evita precisar
  adicionar `SessionProvider`/`useSession().update()` num app que hoje é
  100% server-driven, sem hook de sessão em lugar nenhum.
- `parseProfileInput()` extraído de dentro de `registerUser` em
  `src/lib/auth/actions.ts` — validação dos campos específicos de
  paciente/médico, reaproveitada por `registerUser` (cadastro normal) e
  `completeGoogleSignup`.
- `.env.example` documenta `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` — gerados
  no [Google Cloud Console](https://console.cloud.google.com/), "APIs e
  Serviços" → "Credenciais" → "Criar credenciais" → "ID do cliente OAuth",
  tipo "Aplicativo da Web", URI de redirecionamento
  `<URL_DO_APP>/api/auth/callback/google` (em dev,
  `http://localhost:3000/api/auth/callback/google`). Sem essas variáveis
  no `.env` local, o app builda e roda normal, só o clique em "Google"
  falha ao tentar entrar de verdade.

### Testado

Com build limpo e um usuário real por credenciais (não afetado pela
mudança): login por senha continua funcionando ponta a ponta, e as rotas
protegidas continuam redirecionando pra `/login` sem sessão nenhuma —
confirma que a migração de `role` pra opcional não quebrou nenhum dos ~8
lugares que já liam `session.user.role`.

**Não testado** (precisa de navegador real + conta Google real, igual já
era esperado desde a investigação original): o fluxo OAuth completo —
login Google novo caindo em `/cadastro/completar`, vínculo automático com
conta por senha existente, e a sequência inteira até `/dashboard`. Só dá
pra validar isso de fato depois que o Glauber gerar as credenciais reais
no Google Cloud Console e testar manualmente.

## Migração de JS → TS — concluída

O bootstrap do create-next-app tinha alguns arquivos em `.js`/`.jsx`.
Diretriz seguida: todo arquivo novo já nasceu `.ts`/`.tsx`; os últimos dois
remanescentes (`src/app/page.js`, `src/lib/utils.js`) foram convertidos em
2026-09-06 durante uma reorganização de pastas — não sobra nenhum `.js`/`.jsx`
em `src/`.

## Reorganização de pastas e assets (2026-09-06)

- **`src/assets/images/`** (novo): assets pensados pra serem importados
  direto no código (`import logo from "@/assets/images/arquivo.svg"`),
  usados com `next/image` — dimensão inferida automaticamente do arquivo,
  em vez de w/h fixos "no chute". Os dois logos existentes (`logo-vitta.svg`,
  `tittle.svg`) foram movidos de `public/` pra cá e as referências
  atualizadas de string (`src="/logo-vitta.svg"`) pra `import`.
- **`public/`**: limpo dos 5 SVGs de placeholder do bootstrap do
  create-next-app (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`,
  `window.svg`) — nunca foram referenciados em lugar nenhum do código.
  `public/` continua existindo como destino pra qualquer arquivo que
  precise mesmo de uma URL fixa (o favicon não conta, já fica em
  `src/app/favicon.ico` por convenção do App Router).
- **`src/components/Header.tsx`/`Navbar.tsx`**: eram `Header/index.tsx` e
  `Navbar/index.tsx` (padrão de pasta), inconsistente com todo o resto de
  `src/components/*` que usa arquivo plano. Achatados pra bater com a
  convenção — o caminho de import (`@/components/Header`) não mudou, só o
  arquivo por trás dele.

## Ilustrações de terceiros exigem crédito visível (Storyset/Freepik)

`src/assets/illustrations/` (separada de `images/`, que é só pra branding
própria) guarda ilustrações maiores de bancos de terceiros — a primeira é
`doctor-pana.svg`, usada na etapa 2 do cadastro quando o perfil escolhido é
"Médico" (`CadastroForm.tsx`). A licença gratuita da Storyset (Freepik)
exige um link de atribuição visível na tela onde a ilustração aparece —
não é opcional nem pode ficar só num comentário no código ou num arquivo à
parte. O texto exato exigido (não parafrasear) é "Work illustrations by
Storyset", linkando para `https://storyset.com/work`; implementado como um
link pequeno logo abaixo da ilustração. `src/assets/illustrations/CREDITS.md`
mantém a lista de qual arquivo pede qual crédito, pra não se perder quando
mais ilustrações forem adicionadas — mas o arquivo em si não substitui o
crédito visível na tela.

## "/" nunca é uma home pública — redireciona por sessão

`src/app/page.tsx` era um placeholder ("HOMEPAGE") do bootstrap do
create-next-app, nunca chegou a ser uma tela real do produto — não existe
requisito nem tela de home pública nas specs. Trocado em 2026-09-06 por um
Server Component que só chama `auth()` e redireciona: sem sessão vai pra
`/login`, com sessão vai pra `/dashboard`. Mesmo padrão que `/login` e
`/cadastro` já usavam (checar sessão e redirecionar), só que na direção
oposta e sem UI própria — por isso "/" virou rota dinâmica (`ƒ`) no build,
antes era estática (`○`).

Isso resolve dois pontos pedidos pelo Glauber em 2026-09-06: (1) acessar a
URL raiz sem estar logado cai direto em `/login`; (2) reforça que não há
"área pública" no app — tudo além de `/login` e `/cadastro` exige sessão.
A proteção de fato das rotas autenticadas (`/dashboard`, `/userConfig` e
subrotas) já existia via `middleware.ts` (matcher cobre `/dashboard/:path*`
e `/userConfig/:path*`, redireciona pra `/login?callbackUrl=...` sem
sessão) — testado ponta a ponta em `next build && next start` (o bug de
`next dev` não invocar o middleware já está documentado acima). Cada page
autenticada também tem `if (!session) return null` como reforço, caso
alguém acesse a página por algum caminho que o middleware não cubra.

## Testes automatizados: Vitest (2026-10-10)

Até aqui, verificação era só manual (typecheck + build + teste ponta a
ponta com conta real, documentado em cada seção de specs). O Glauber trouxe
um documento de referência técnica sobre classificação glicêmica e pediu
testes de verdade pras regras de negócio — decidido junto com ele adicionar
um test runner em vez de só documentar a matriz de casos.

- **Vitest** (`devDependency`, não pinado com versão exata como o
  TypeScript — não tem o mesmo tipo de breaking change documentado).
  Escolhido por ser leve, rodar TS nativamente sem configuração de
  transpilação própria, e não exigir Babel/ts-jest.
- `vitest.config.mts` — resolve o alias `@/*` igual o `tsconfig.json`;
  `environment: "node"` (sem jsdom, já que por enquanto só funções puras de
  `src/lib/**` são testadas, nenhum componente React); `.mts` (não `.ts`)
  pra evitar aviso de ESM/CommonJS do Vite.
- `npm test` roda `vitest run` (uma vez, não "watch") — inclui só
  `src/**/*.test.ts`, arquivo colocado ao lado do módulo que testa (ex.:
  `src/lib/patient/limits.test.ts` ao lado de `limits.ts`).
- Cobertura inicial: `src/lib/patient/limits.test.ts` (limites de inserção
  de dado, ver `04-modelo-de-dados.md`) e `src/lib/patient/glucose.test.ts`
  (matriz de valor-limite do motor de alertas `glucoseAlert`, fórmula do
  `estimateHbA1c`, degradê de cor do `hba1cColor`) — análise de valor-limite
  (BVA), mesmo espírito do documento de referência que o Glauber trouxe,
  mas usando os limiares/faixas já implementados no Vitta.
- Não testado ainda (próximos candidatos naturais, não feito agora por não
  ser o foco do pedido): `trend.ts` (RF13) e `motivation.ts` (RF12) — mesmo
  padrão de função pura, dá pra seguir o mesmo modelo depois.
- Não roda em CI (não existe pipeline de CI configurado neste projeto) —
  só local, via `npm test`, antes de commit.
