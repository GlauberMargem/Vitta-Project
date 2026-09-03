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
- [x] Cálculo de limites de referência e alerta visual de hipo/hiperglicemia
      — `src/lib/patient/glucose.ts` (`glucoseAlert`), limites e fontes
      documentados em `04-modelo-de-dados.md`. Badge de alerta (`#FFB5A7`) no
      histórico do dashboard por registro fora da faixa.
- [x] Cálculo de estimativa de HbA1c (média 90 dias) — fórmula ADAG
      (`estimateHbA1c` em `glucose.ts`), card no topo do dashboard com meta
      de referência `<7%`, só aparece se houver ao menos um registro no
      período

## 4. Perfil do paciente
- [ ] Tela de perfil (dados pessoais / dados clínicos) migrada para TS e ligada
      ao banco

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
- [ ] Rota/layout exclusivo do médico
- [ ] Listagem de pacientes vinculados com indicador de risco
- [ ] Tela de histórico do paciente (somente leitura) para o médico
- [ ] Criação de anotação clínica

## 7. Extras de prioridade Média/Baixa
- [ ] Exportação de relatório em PDF (RF08)
- [ ] Feedbacks motivacionais (RF12)

## 8. Não-funcionais transversais (revisar a cada bloco acima)
- [ ] Checklist LGPD (RNF03) antes de cada release
- [ ] Auditoria de acessibilidade (RNF05) nas telas novas
- [ ] Índices de banco conforme `04-modelo-de-dados.md` (RNF06)
