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

## 1. Autenticação e cadastro (RF01)
- [ ] Tela de login (migrar `/login` para TS, ligar ao NextAuth)
- [ ] Fluxo de cadastro em 2 etapas com seleção de perfil
- [ ] Middleware/guard de rota: redireciona por `role` após login

## 2. Registro de dados do paciente (RF02, RF03)
- [ ] Migrations `glucose_records`, `meals`
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
- [ ] Migration `patient_doctor_links`
- [ ] Médico gera código de convite
- [ ] Paciente consome código de convite

## 6. Painel do médico (RF06, RF07, RF09)
- [ ] Rota/layout exclusivo do médico
- [ ] Listagem de pacientes vinculados com indicador de risco
- [ ] Tela de histórico do paciente (somente leitura) para o médico
- [ ] Migration `clinical_notes` + criação de anotação

## 7. Extras de prioridade Média/Baixa
- [ ] Exportação de relatório em PDF (RF08)
- [ ] Feedbacks motivacionais (RF12)

## 8. Não-funcionais transversais (revisar a cada bloco acima)
- [ ] Checklist LGPD (RNF03) antes de cada release
- [ ] Auditoria de acessibilidade (RNF05) nas telas novas
- [ ] Índices de banco conforme `04-modelo-de-dados.md` (RNF06)
