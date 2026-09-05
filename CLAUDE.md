# Sistema Vitta

Aplicação web para registro e monitoramento de glicemia, apoiando a autogestão do
Diabetes Mellitus pelo paciente e o telemonitoramento assistido pelo médico. Projeto de
TCC (UniRios) de Glauber Lima Margem Simplício — a monografia (TG-I) descreve
fundamentação teórica, requisitos e protótipo; a implementação (TG-II) é este repositório.

## Regras de colaboração

- Linguagem simples e direta nas respostas.
- Nunca usar emojis.
- Se algo pedido estiver fora do escopo definido nas specs, explicar de forma
  simples o porquê e perguntar antes de agir — não expandir escopo por conta própria.
- Nunca inventar informação (endpoint, biblioteca, comportamento, valor). Se não
  souber ou não estiver documentado nas specs/monografia, perguntar ao Glauber.

## Stack obrigatória

- **Next.js** (App Router) — frontend + backend unificados (API Routes), SSR.
- **React** para componentização de UI.
- **TypeScript** em toda a base de código nova — tipagem estática obrigatória.
  `tsconfig.json` já configurado (`strict: true`). As páginas/componentes antigos
  em `.js`/`.jsx` (bootstrap do create-next-app) ainda não foram migrados; migrar
  para `.tsx` ao tocar nesses arquivos, não manter o padrão antigo em código novo.
  ⚠️ Versão do TypeScript **fixada em `5.9.3`** (`--save-exact`). A versão
  `latest` do npm hoje é a `7.x` (reescrita nativa do compilador), que não tem
  mais o arquivo `typescript/lib/typescript.js` — o Next.js 16.1.1 depende
  desse arquivo pra detectar TypeScript e quebra o build sem ele (erro
  genérico `The "id" argument must be of type string`). Não rodar
  `npm update typescript` sem checar compatibilidade antes.
- **Tailwind CSS** para toda a estilização (utilitário, mobile-first). Não introduzir
  outra abordagem de estilização (CSS-in-JS, Sass, etc.).
- **PostgreSQL** para persistência (dados clínicos e de perfis). Banco local
  `vitta_dev` já criado (serviço Windows `postgresql-x64-17`). ORM: **Prisma 7**,
  já configurado com o driver adapter `@prisma/adapter-pg` (ver
  `specs/05-arquitetura.md`).
- **NextAuth/OAuth** para autenticação. Configurado com **Auth.js v5**
  (`next-auth@5.0.0-beta.32`, config em `src/lib/auth/config.ts`) — por ora só
  provider de credenciais (email/senha com bcrypt), sessão JWT. Login social
  Google ainda não habilitado — falta Client ID/Secret.
- Componentes de UI seguem o padrão shadcn/ui (`components.json`, `src/components/ui`,
  `class-variance-authority`, `tailwind-merge`, `lucide-react` para ícones).
- Hospedagem alvo: Vercel.

## Estrutura atual do projeto

```
middleware.ts                 guarda de rota (Auth.js) — protege /dashboard, /userConfig
src/app/layout.tsx             layout raiz (fontes, sem Header/Navbar)
src/app/login/                 tela de login (page.tsx + LoginForm.tsx), fora do grupo (app)
src/app/cadastro/              tela de cadastro (page.tsx + CadastroForm.tsx), fora do grupo (app)
src/app/(app)/                 route group com Header/Navbar: /dashboard, /userConfig
src/app/(app)/dashboard/       home real do paciente (HbA1c, gráfico semanal, Ações, histórico) OU painel do
                                médico (gerar convite, pacientes vinculados com indicador de risco), por role
src/app/(app)/dashboard/pacientes/[patientId]/  histórico somente leitura de um paciente vinculado, pro médico
src/app/(app)/userConfig/      perfil real — 2 sub-telas paginadas: dados pessoais (nome/email/senha) +
                                dados clínicos (paciente) ou profissionais (médico)
src/app/api/auth/[...nextauth]/route.ts  handler do Auth.js
src/components/                Navbar/Header (TS, tokens do design system, avatar/iniciais, toque de 44px),
                                src/components/ui (shadcn), icons/
src/components/patient/        NovaGlicoseDialog, NovaRefeicaoDialog (shadcn Dialog), GlicemiaChart (Recharts) +
                                GlicemiaChartCard (seletor de período dia/semana/mês), RelatorioPdfButton
                                (jsPDF, RF08), MotivacaoCard (RF12, só paciente), VinculoMedicoCard,
                                HbA1cCard, HistoricoList (reaproveitados no painel do médico)
src/components/doctor/         GerarConviteCard, NovaAnotacaoForm (anotação clínica, só o médico vê)
src/components/profile/        ProfileView (paginação), DadosPessoaisForm (+ troca de senha),
                                DadosClinicosForm, DadosProfissionaisForm
src/lib/utils.js               helpers (cn, etc.)
src/lib/db/client.ts           singleton do Prisma Client (com driver adapter)
src/lib/auth/config.base.ts    config Auth.js edge-safe (sem providers/banco) — usada por middleware.ts
src/lib/auth/config.ts         config Auth.js completa (provider de credenciais) — usada no resto do app
src/lib/auth/actions.ts        server actions: authenticate (login), registerUser (cadastro)
src/lib/patient/actions.ts     server actions: createGlucoseRecord, createMeal, consumeInviteCode, revokeLink
src/lib/patient/format.ts      helpers de exibição (contextLabel, formatDateTime)
src/lib/patient/glucose.ts     limites clínicos (hipo/hiperglicemia), estimativa de HbA1c (fórmula ADAG),
                                agregação diária/semanal/mensal, getPeriodRange (janelas dia/semana/mês,
                                usada pelo gráfico e pelo PDF), risco mais grave — fontes em
                                specs/04-modelo-de-dados.md
src/lib/patient/history.ts     buildHistory: mescla glicose+refeição por data (paciente e médico usam a
                                mesma); buildReportHistories: idem, sem limite de linhas, por período
                                (RF08)
src/lib/patient/motivation.ts  RF12: dias distintos com glicose nos últimos 7 dias corridos + as 5
                                mensagens motivacionais (textos exatos, não parafrasear)
src/lib/doctor/actions.ts      server actions: generateInviteCode (código de 8 caracteres, sem 0/O/1/I/L),
                                createClinicalNote (valida vínculo ACTIVE do médico antes de gravar)
src/lib/profile/actions.ts     server actions: updateBasicInfo, changePassword (exige senha atual),
                                updatePatientClinicalData, updateDoctorProfessionalData
src/types/next-auth.d.ts       augmentation de tipos (Session/JWT com id/role)
src/generated/prisma           client do Prisma gerado (não editar à mão, não commitado)
prisma/schema.prisma           schema do banco — ver specs/04-modelo-de-dados.md
```

Rotas que precisam de Header/Navbar (área logada) vão dentro de `src/app/(app)/`;
login/cadastro ficam fora desse grupo (tela cheia, sem navegação do app).

Mutação de dados do paciente é sempre via server action (`src/lib/patient/actions.ts`),
lendo direto do Prisma em Server Components — sem API Routes próprias, seguindo
`data-patterns.md` da skill `next-best-practices` (API Route só se justifica pra
acesso externo/webhook).

⚠️ `middleware.ts` só funciona testado em `npm run build && npm run start` —
há um bug confirmado onde `next dev` (Turbopack e Webpack) nunca invoca o
middleware nesta versão do Next (16.1.1). Ver `specs/05-arquitetura.md`.

**MVP pronto pra homologação** (RF01–RF07, RF09, RF10, RF11 — ver
`specs/09-sprints.md`). Ainda não existem, deliberadamente fora do corte
inicial: limites de hipo/hiper configuráveis por paciente (hoje são globais
no código), login social Google.

## Dois perfis de usuário — regras de negócio

### Paciente
- Interface mobile-first, focada em reduzir carga cognitiva (Heurísticas de Nielsen,
  Modelo de Fogg: motivação + capacidade + gatilho).
- Registro de glicose: valor (mg/dL), data, horário, contexto (jejum, pós-prandial,
  antes de dormir) — via modal simples sobre a tela, sem navegação.
- Registro de refeição: busca de refeição cadastrada ou carboidratos + horário.
- Dashboard: estimativa de HbA1c (média dos últimos 90 dias) em destaque, com meta
  clínica de referência; gráfico de tendência glicêmica (diária/semanal/mensal).
- Alertas visuais automáticos quando um registro estiver fora dos limites de
  hipo/hiperglicemia configurados.
- Feedbacks motivacionais com base na consistência dos registros.
- Autonomia total sobre os próprios dados. Vínculo a um médico é **opcional**, via
  código de convite — o app deve funcionar plenamente sem vínculo.

### Médico
- **Somente leitura/anotação** sobre dados clínicos do paciente: nunca pode inserir
  ou alterar registros de glicose/refeição do paciente. Pode adicionar anotações
  clínicas próprias vinculadas ao histórico do paciente.
- Painel centralizado com lista de pacientes vinculados; indicadores visuais para
  pacientes em risco glicêmico (fora dos limites de referência).
- Geração de relatórios glicêmicos exportáveis em PDF.
- Acesso a um paciente só existe após vínculo por código de convite — nunca por
  busca livre de pacientes.

## Segurança e privacidade (não negociável)

- Dados de glicemia/saúde são "dados sensíveis" sob a LGPD (Lei 13.709/2018):
  finalidade, necessidade e segurança devem guiar toda decisão de modelagem.
- **Privacy by design**: controle de acesso deve isolar paciente e médico desde o
  schema do banco — um perfil nunca acessa dados de outro sem autorização explícita
  (vínculo por convite).
- Autenticação via NextAuth/OAuth; nunca implementar autenticação própria "na mão".
- Criptografar dados sensíveis em repouso quando aplicável.

## Requisitos não funcionais a manter em mente

- Tempo de resposta < 2s, mesmo em conexão móvel lenta (RNF01).
- Responsivo mobile-first, para desktop/tablet também (RNF02).
- Acessível a usuários com baixo letramento digital / idosos: fontes legíveis,
  navegação intuitiva, poucos passos por tela (RNF05).
- Código modular e documentado o suficiente para manutenção futura (RNF08) — sem
  comentários redundantes, só o que não é óbvio pelo nome/estrutura.

## Diretrizes de UX

- Minimalismo: cada tela expõe só os campos essenciais (ex.: tela de login só
  e-mail/senha + login social).
- Onboarding progressivo: cadastro em duas etapas (dados gerais → dados específicos
  do perfil paciente/médico), nunca um formulário longo único.
- Ações frequentes (registrar glicose/refeição) devem ser alcançáveis em poucos
  toques a partir da home.
- Gráficos como ferramenta clínica, não decoração — priorizar leitura rápida de
  tendências (ex.: gráfico de área) sobre estética pura.
