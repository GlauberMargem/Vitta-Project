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
      Link "Cadastre-se aqui" aponta para `/cadastro`, que ainda não existe
      (próximo item abaixo).
- [ ] Fluxo de cadastro em 2 etapas com seleção de perfil
- [ ] Middleware/guard de rota: redireciona por `role` após login

## 2. Registro de dados do paciente (RF02, RF03)
- [x] Migrations `glucose_records`, `meals` — já existem desde a migração
      `20260902225148_init` (bloco 0), o schema completo foi criado de uma vez
- [ ] API Route: criar/listar `glucose_records`
- [ ] API Route: criar/listar `meals`
- [ ] Modal "Nova Glicose" + "Nova Refeição" na home do paciente
- [ ] Home do paciente exibindo histórico recente

## 3. Visualização (RF04, RF05, RF11)
- [ ] Componente de gráfico de tendência (semanal)
- [ ] Cálculo de limites de referência e alerta visual de hipo/hiperglicemia
- [ ] Cálculo de estimativa de HbA1c (média 90 dias)

## 4. Perfil do paciente
- [ ] Tela de perfil (dados pessoais / dados clínicos) migrada para TS e ligada
      ao banco

## 5. Vínculo paciente-médico (RF10)
- [x] Migration `patient_doctor_links` — já existe desde o bloco 0
- [ ] Médico gera código de convite
- [ ] Paciente consome código de convite

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
