# Roadmap do MVP

Ordem sugerida — cada bloco depende do anterior. Marcar `[x]` ao concluir e
atualizar o status correspondente em `02-requisitos-funcionais.md`.

## 0. Fundação técnica
- [x] Instalar TypeScript e configurar `tsconfig.json` (substitui o `jsconfig.json`)
- [x] Instalar e configurar Prisma 7 + driver adapter `@prisma/adapter-pg` —
      ver `04-modelo-de-dados.md` e `05-arquitetura.md`
- [x] Configurar PostgreSQL local (serviço Windows já instalado, banco
      `vitta_dev` criado) + `.env`
- [x] Criar schema/migrations iniciais (todas as tabelas de
      `04-modelo-de-dados.md`) — migração `20260902225148_init` aplicada
- [x] Configurar NextAuth — Auth.js v5 (`next-auth@5.0.0-beta.32`), provider de
      credenciais com bcrypt, sessão JWT com `id`/`role` customizados. Testado
      ponta a ponta (login válido, senha errada rejeitada). Google OAuth fica
      para quando houver Client ID/Secret
- [x] Configurar tokens de cor/tipografia do Tailwind conforme
      `08-design-system.md` (Poppins + Inter confirmados; `globals.css`
      atualizado; `layout.js` migrado para `layout.tsx`)
- [x] Trocar Material Symbols (resquício pré-specs) por `lucide-react` em
      `Navbar`/`Header`, e remover o `<link>` manual de fonte do
      `layout.tsx` (violava boas práticas de Next — ver `05-arquitetura.md`)

## 1. Autenticação e cadastro (RF01)
- [x] Tela de login (`src/app/login/page.tsx` + `LoginForm.tsx`, server action
      em `src/lib/auth/actions.ts`, ligada ao NextAuth). Testada ponta a ponta
      simulando o POST real do formulário (login válido redireciona a
      `/dashboard` com sessão criada). Reestruturou `src/app/(app)/` como
      route group para isolar Header/Navbar das telas de autenticação —
      `/login` e futuramente `/cadastro` ficam fora desse grupo.
      Botão do Google renderizado desabilitado (OAuth não configurado ainda).
      Link "Esqueci minha senha" é só texto por enquanto (sem fluxo por trás).
      Link "Cadastre-se aqui" aponta para `/cadastro`.
- [x] Fluxo de cadastro em 2 etapas com seleção de perfil
      (`src/app/cadastro/page.tsx` + `CadastroForm.tsx`, server action
      `registerUser` em `src/lib/auth/actions.ts`). Cria `User` +
      `PatientProfile`/`DoctorProfile` numa escrita aninhada do Prisma, loga
      automaticamente após criar a conta. Testado ponta a ponta: paciente,
      médico e rejeição de email duplicado — todos via POST real simulando o
      formulário. Campo "RQE" do protótipo virou "Especialidade" (texto
      livre), porque o schema não define uma lista fechada de especialidades
      e eu não ia inventar uma.
- [x] Middleware/guard de rota: redireciona por `role` após login —
      `middleware.ts` (não `proxy.ts`, ver `05-arquitetura.md`) bloqueia
      `/dashboard` e `/userConfig` sem sessão via callback `authorized` do
      Auth.js. ⚠️ Bug confirmado: não funciona em `next dev` nesta versão do
      Next (16.1.1) — só testável com `npm run build && npm run start`. Guard
      por `role` específico (paciente vs. médico) ainda não existe porque só
      existe uma área logada `(app)` até agora; farei a divisão quando o
      painel do médico existir (bloco 6).

## 2. Registro de dados do paciente (RF02, RF03)
- [x] Migrations `glucose_records`, `meals` — já existem desde a migração
      `20260902225148_init` (bloco 0), o schema completo foi criado de uma vez
- [x] Criar/listar `glucose_records` — via server action (`createGlucoseRecord`
      em `src/lib/patient/actions.ts`), não API Route. Seguindo o
      `data-patterns.md` da skill `next-best-practices`: Server Component lê
      direto do Prisma (sem API própria), Server Action pra mutação — API
      Route só faz sentido pra acesso externo/webhook, que não é o caso aqui.
- [x] Criar/listar `meals` — mesmo padrão (`createMeal`)
- [x] Modal "Nova Glicose" + "Nova Refeição" na home do paciente
      (`src/components/patient/NovaGlicoseDialog.tsx` e
      `NovaRefeicaoDialog.tsx`, shadcn Dialog). RF02 exige campo de contexto
      (jejum/pós-prandial/etc.) que o mockup original não mostrava — mantive
      o requisito formal, não o mockup incompleto. Campo "Buscar refeição já
      registrada" do mockup virou um `<datalist>` sugerindo nomes de
      refeições já usadas pelo paciente (não existe uma tabela de "refeições
      salvas" separada no schema).
- [x] Home do paciente exibindo histórico recente (últimos 10 registros de
      glicose + refeição, misturados por data)

## 3. Visualização (RF04, RF05, RF11)
- [x] Componente de gráfico de tendência (semanal) — `GlicemiaChart.tsx`,
      Recharts via shadcn/ui Charts (ver `05-arquitetura.md`), área com os 7
      dias da semana corrente, média diária, domínio fixo do eixo Y (50–500
      mg/dL, conforme `08-design-system.md`)
- [x] Gráficos diário e mensal (backlog pós-homologação) — `GlicemiaChartCard.tsx`
      adiciona um seletor de período (Dia/Semana/Mês) reaproveitando o mesmo
      `GlicemiaChart`; diário lista cada aferição do dia corrente (sem média),
      mensal agrega média diária dos últimos 30 dias corridos — funções
      `buildDailyGlucoseSeries`/`buildMonthlyGlucoseSeries` em `glucose.ts`.
      Reaproveitado também na tela do médico (`/dashboard/pacientes/[patientId]`)
- [x] Cálculo de limites de referência e alerta visual de hipo/hiperglicemia
      — `src/lib/patient/glucose.ts` (`glucoseAlert`), limites e fontes
      documentados em `04-modelo-de-dados.md`. Badge de alerta (`#FFB5A7`) no
      histórico do dashboard por registro fora da faixa.
- [x] Cálculo de estimativa de HbA1c (média 90 dias) — fórmula ADAG
      (`estimateHbA1c` em `glucose.ts`), card no topo do dashboard com meta
      de referência `<7%`, só aparece se houver ao menos um registro no
      período

## 4. Perfil do usuário
- [x] Tela de perfil (dados pessoais / dados clínicos) migrada para TS e ligada
      ao banco — `src/app/(app)/userConfig/page.tsx`, 2 sub-telas com
      paginação (`ProfileView.tsx`), dados pessoais (nome/email/senha) +
      dados clínicos (paciente) ou profissionais (médico). Implementado
      depois da homologação, backlog pós-Sprint 6 — ver `09-sprints.md`.
      **Desvio**: o mockup original só cobria a tela de perfil do paciente
      (a área do médico nunca foi prototipada); estendi a mesma estrutura
      pro médico (dados pessoais + CRM/especialidade) por consistência, não
      por estar em nenhuma spec visual.

## 5. Vínculo paciente-médico (RF10)
- [x] Migration `patient_doctor_links` — já existe desde o bloco 0. Alterada
      no Sprint 4 (`patient_id` nullable, `invite_code` unique) — ver
      `04-modelo-de-dados.md`
- [x] Médico gera código de convite — `generateInviteCode` em
      `src/lib/doctor/actions.ts`, código de 8 caracteres sem 0/O/1/I/L
- [x] Paciente consome código de convite — `consumeInviteCode` em
      `src/lib/patient/actions.ts`; regra de um vínculo `active` por vez
      (paciente precisa revogar antes de trocar de médico)
- [x] Paciente vê a quem está vinculado / pode revogar — `revokeLink`,
      `VinculoMedicoCard.tsx`

## 6. Painel do médico (RF06, RF07, RF09)
- [x] Migration `clinical_notes` — já existe desde o bloco 0
- [x] Rota/layout exclusivo do médico — `/dashboard` já renderiza conteúdo
      totalmente diferente por `role` desde o Sprint 4 (`DoctorDashboard`);
      não criei um path `/medico` separado (custaria lógica extra de
      redirecionamento pós-login sem ganho real) — ver `09-sprints.md`,
      Sprint 5
- [x] Listagem de pacientes vinculados com indicador de risco —
      `src/app/(app)/dashboard/page.tsx` (`DoctorDashboard`), risco calculado
      com `mostSevereAlert` sobre os registros dos últimos 7 dias de cada
      paciente vinculado
- [x] Tela de histórico do paciente (somente leitura) para o médico —
      `/dashboard/pacientes/[patientId]`, reaproveita `GlicemiaChart`,
      `HbA1cCard`, `HistoricoList` já criados nos Sprints 3/4. Acesso
      valida vínculo `ACTIVE` do médico com aquele paciente antes de
      qualquer leitura (nunca por `patientId` direto) — `notFound()` senão
- [x] Criação de anotação clínica — `createClinicalNote` em
      `src/lib/doctor/actions.ts`, `NovaAnotacaoForm.tsx`. Visível só pro
      médico que escreveu (decisão confirmada com o Glauber em 2026-09-03) —
      ver `02-requisitos-funcionais.md`

## 7. Extras de prioridade Média/Baixa
- [x] Exportação de relatório em PDF (RF08) — feito em 2026-09-05, backlog
      pós-homologação. `RelatorioPdfButton.tsx` (client), biblioteca `jsPDF` +
      `jspdf-autotable` (decisão confirmada com o Glauber: gerar 100% no
      navegador, sem servidor/Chromium — mais leve e compatível com Vercel
      serverless). Período selecionável (dia/semana/mês, reaproveitando
      `getPeriodRange` de `glucose.ts`), conteúdo = tabela completa de
      glicose/refeição do período (sem limite de linhas) + resumo de HbA1c.
      Disponível na home do paciente e na tela do médico sobre um paciente
      vinculado — como já indicava `06-fluxos-e-telas.md`. Bibliotecas
      importadas via `import()` dinâmico (só carregam quando o botão é
      clicado, não pesam no carregamento inicial da página — RNF01).
- [ ] Feedbacks motivacionais (RF12)

## 9. Refino de Header/Navbar e acessibilidade (backlog pós-homologação)
- [x] Tamanho de toque dos botões — `src/components/ui/button.tsx`: tamanho
      `default` de 36px (`h-9`) para 44px (`h-11`), `icon` de 36px (`size-9`)
      para 44px (`size-11`), `lg`/`icon-lg` ajustados pra continuar maiores
      que o `default` (48px). Segue a recomendação de toque mínimo do RNF05,
      anotada como achado no Sprint 6. Tamanhos `sm`/`xs` não mudaram — são
      controles secundários/compactos (ex.: seletor de período do gráfico),
      não ações primárias.
- [x] Header migrado pra `.tsx`, cores trocadas dos valores hardcoded
      (`#6A97C6`, cinzas) pros tokens do design system (`bg-card`,
      `border-border`). Lado direito ganhou um avatar circular com as
      iniciais do nome, linkando pra `/userConfig` — reaproveita `session`
      via `auth()` (Header virou Server Component `async`). **Desvio**: o
      mockup pede também um sino de notificação ao lado do avatar; não
      implementado porque não existe sistema de notificação no MVP
      (`05-arquitetura.md` já registra push notification como fora do corte
      inicial) — um ícone decorativo sem função por trás seria enganoso.
      Logo também passou a linkar pra `/dashboard` em vez de `/` (a raiz é
      só a página placeholder do bootstrap do create-next-app, nunca fazia
      sentido como destino do cabeçalho da área logada).
- [x] Navbar migrada pra `.tsx`, cores trocadas pros tokens do design
      system, toque de 44px, estado ativo (`aria-current`) via `usePathname`.
      **Desvio**: reduzida de 3 pra 2 ícones (Início, Perfil). O mockup tem
      um terceiro ícone de "Gráficos", mas o app nunca teve uma rota
      separada pra isso — o gráfico sempre viveu embutido no dashboard
      (decisão do Sprint 3). O ícone de "Gráficos" antigo apontava pra
      `/dashboard/`, a mesma rota do ícone "Início" (que por sua vez
      apontava erroneamente pra `/`, fora da área logada) — mantê-lo
      apontando pra um destino duplicado não agregava nada.

## 8. Não-funcionais transversais (revisar a cada bloco acima)
- [x] Checklist LGPD (RNF03) — feito no Sprint 6, ver `09-sprints.md`
- [x] Auditoria de acessibilidade (RNF05) nas telas novas — feito no
      Sprint 6, achados registrados em `09-sprints.md`. Item de tamanho de
      toque corrigido pós-homologação (ver bloco 9)
- [x] Índices de banco conforme `04-modelo-de-dados.md` (RNF06) — os 4
      índices listados já existiam desde a migração `20260902225148_init`
      (bloco 0); conferido no Sprint 6 que nenhum ficou pra trás
