# Fluxos e Telas

Baseado no protótipo do Apêndice 2 da monografia. Rotas atuais no repo entre
parênteses quando já existem.

## Autenticação

- **Login** (`/login`, já existe como página): e-mail + senha, login social
  (Google), link "esqueci minha senha", link para cadastro. Só os campos
  essenciais visíveis (heurística de minimalismo).
- **Cadastro — etapa 1**: nome, e-mail, senha, confirmação, seletor
  Paciente/Médico.
- **Cadastro — etapa 2 (médico)**: CRM, especialidade/RQE.
- **Cadastro — etapa 2 (paciente)**: data de nascimento, tipo de diabetes.

## Área do Paciente

- **Home / Dashboard** (`/dashboard`, já existe como página — hoje genérica,
  precisa virar a home do paciente): saudação, estimativa de HbA1c em destaque
  com meta de referência, ações rápidas (registrar glicose `+`, registrar
  refeição 🍴), navegação inferior (Home / Gráficos / Perfil).
- **Modal — Nova Glicose**: valor (mg/dL), horário da aferição, vínculo
  opcional com uma refeição recente (RF14).
- **Modal — Nova Refeição**: buscar refeição já registrada OU carboidratos +
  horário, vínculo opcional com uma glicose recente (RF14).
- **Fluxo de sugestão de refeição (RF14, pós-monografia, 2026-09-06)**: depois
  de salvar uma glicose sem vínculo escolhido, se não existir nenhuma
  refeição registrada dentro de ±2h daquele horário, aparece um prompt
  perguntando se o paciente comeu algo recentemente; ao confirmar, abre o
  modal de Nova Refeição já com o vínculo pré-selecionado (o paciente ainda
  precisa salvar pra confirmar — nada é criado automaticamente). Implementado
  em `src/components/patient/AcoesRapidas.tsx`.
- **Gráficos**: evolução glicêmica por período (semana por padrão no MVP; filtros
  mensal/trimestral podem vir depois), gráfico de área, eixo Y em mg/dL.
- **Perfil** (`/userConfig`, já existe — precisa dividir em 2 sub-telas): dados
  pessoais (nome, e-mail, senha) e dados clínicos (data de nascimento, tipo de
  diabetes), navegação por paginação entre as duas.

## Área do Médico

Ainda não prototipada na monografia — inferir dos RFs (RF06/RF07/RF08/RF09):

- **Painel de pacientes**: lista de pacientes vinculados (ativos), com indicador
  visual (cor/ícone) para quem está fora dos limites de referência recentemente.
- **Histórico do paciente**: ao abrir um paciente da lista, ver o mesmo tipo de
  gráfico/histórico do paciente, somente leitura, + campo para anotação clínica.
- **Vínculo por convite**: tela/ação para o médico gerar um código de convite
  (consumido pelo paciente no fluxo dele, RF10).
- **Exportar relatório PDF** (RF08): ação disponível tanto na home do paciente
  quanto na visão do médico sobre um paciente.

## Navegação global

- Paciente e médico compartilham o mesmo app, mas o layout pós-login diverge
  totalmente por `role` — não existe uma "home genérica" comum além do
  login/cadastro.
