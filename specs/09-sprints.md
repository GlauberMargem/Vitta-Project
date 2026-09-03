# Plano de Sprints

Adaptado do template da skill `sprint-planning` (Anthropic) pro contexto real
deste projeto: **dev solo (Glauber), sprints de 1 semana, ~5-10h/semana**, sem
data-limite fixa, mas com o objetivo de chegar o mais rápido possível a um
MVP pronto para a fase de **homologação** (testes de usabilidade com pacientes
e médicos reais, descrita em `specs/01-visao-geral.md` e na monografia).

Backlog-fonte: `07-roadmap.md`. Cada sprint aqui puxa um pedaço dele. Ao
concluir um sprint, marcar os itens correspondentes como `[x]` no roadmap
também — este arquivo não substitui o roadmap, só o organiza no tempo.

## Premissas (revisar se mudarem)

- Capacidade: ~5-10h/semana, sem outras pessoas na equipe.
- Sem data de defesa fechada ainda — o critério de corte é "pronto pra
  homologação", não uma data no calendário.
- Estimativas abaixo são um chute educado, não uma medição real de
  velocidade. **Depois do Sprint 2, vale recalibrar** as sprints seguintes com
  base no que realmente coube em uma semana.
- "Semana 1, Semana 2..." são relativas ao início real do trabalho, não datas
  fixas — quando você começar de fato, é só substituir pelas datas do
  calendário.

## Definição de pronto pra homologação

RF01–RF07 (prioridade Alta) funcionando fim a fim, para os dois perfis
(paciente e médico), mais RF10 (vínculo) — que é Média na tabela de
requisitos, mas é **pré-requisito técnico** de RF06/RF07 (painel do médico só
existe se houver paciente vinculado). RF08, RF09, RF11, RF12 e Google OAuth
ficam fora do corte inicial — ver "Backlog pós-homologação" no fim.

---

## Sprint 1 — Cadastro e guarda de rota
**Objetivo:** qualquer pessoa cria conta (paciente ou médico) e, ao logar, cai
automaticamente na área certa; quem não está logado não acessa a área logada.

| Prioridade | Item | Origem |
|---|---|---|
| P0 | Cadastro etapa 1 (dados gerais + seletor Paciente/Médico) | roadmap bloco 1 |
| P0 | Cadastro etapa 2 (paciente: nascimento + tipo de diabetes / médico: CRM + especialidade) | roadmap bloco 1 |
| P0 | `proxy.ts`: bloqueia `(app)/*` sem sessão, redireciona pra `/login`; usuário já logado não vê `/login` de novo | roadmap bloco 1, `05-arquitetura.md` |
| P1 | Validação de senha (confirmação, tamanho mínimo) | — |

**Riscos:** ainda não existe área separada para médico, então o "redireciona
por role" fica só parcial nesta sprint (o guard geral já vale).
**Definição de pronto:** dá pra criar conta paciente, criar conta médico,
logar com as duas, e um usuário deslogado não consegue abrir `/dashboard`
direto pela URL.

---

## Sprint 2 — Registro de glicose e refeição
**Objetivo:** paciente logado registra uma glicemia e uma refeição de
verdade, e vê isso no histórico.

| Prioridade | Item | Origem |
|---|---|---|
| P0 | Criar/listar `glucose_records` (API route ou server action) | roadmap bloco 2 |
| P0 | Criar/listar `meals` | roadmap bloco 2 |
| P0 | Modal "Nova Glicose" ligado à API real | roadmap bloco 2 |
| P0 | Modal "Nova Refeição" ligado à API real | roadmap bloco 2 |
| P1 | Home do paciente exibindo histórico recente (lista simples, sem gráfico ainda) | roadmap bloco 2 |

**Riscos:** nenhum de fato — é trabalho direto de CRUD sobre schema que já
existe.
**Definição de pronto:** um registro criado no modal aparece no banco
vinculado ao paciente certo, e some ao consultar outro usuário.

---

## Sprint 3 — Gráficos, HbA1c estimado e alertas

⚠️ **Duas decisões pendentes antes de começar** (ver `specs/08-design-system.md`
e `04-modelo-de-dados.md`):
1. **Biblioteca de gráficos** — a monografia menciona "bibliotecas de
   gráficos" de forma genérica, sem escolher uma. Preciso que você decida
   (ex.: Recharts, Chart.js, Tremor) antes de eu começar, ou que me autorize a
   escolher — não vou inventar isso sozinho.
2. **Limites clínicos de hipo/hiperglicemia** — RF05 fala em "limites... 
   configurados", mas não existe um valor de referência definido em nenhuma
   spec. São dados clínicos; não vou chutar números de mg/dL. Preciso de um
   valor de referência (ex.: das diretrizes da SBD citadas na monografia) ou
   que você me diga qual usar como padrão.

| Prioridade | Item | Origem |
|---|---|---|
| P0 | Componente de gráfico de área (semanal), dados reais | roadmap bloco 3 |
| P0 | Cálculo e exibição de HbA1c estimado (média 90 dias) | roadmap bloco 3 (RF11) |
| P0 | Alerta visual quando registro está fora dos limites | roadmap bloco 3 (RF05) |
| P1 | Limites configuráveis (mesmo que só editável via banco por enquanto) | — |

**Definição de pronto:** dashboard do paciente mostra HbA1c, gráfico semanal
com dados reais, e destaca visualmente registros fora da faixa configurada.

---

## Sprint 4 — Vínculo paciente-médico
**Objetivo:** um médico gera um código, um paciente usa esse código pra se
vincular a ele.

| Prioridade | Item | Origem |
|---|---|---|
| P0 | Médico gera código de convite | roadmap bloco 5 (RF10) |
| P0 | Paciente consome código de convite | roadmap bloco 5 (RF10) |
| P1 | Paciente vê a quem está vinculado / pode revogar | — |

**Riscos:** depende de já existir pelo menos uma conta médico (Sprint 1) —
sem risco técnico, só ordem.
**Definição de pronto:** vínculo aparece em `patient_doctor_links` com
`status = active`, visível pelos dois lados.

---

## Sprint 5 — Painel do médico
**Objetivo:** médico loga e vê os pacientes vinculados, com destaque pra quem
está em risco.

| Prioridade | Item | Origem |
|---|---|---|
| P0 | Rota/layout exclusivo do médico | roadmap bloco 6 (RF06) |
| P0 | Listagem de pacientes vinculados | roadmap bloco 6 (RF06) |
| P0 | Indicador visual de risco (usa os limites do Sprint 3) | roadmap bloco 6 (RF07) |
| P1 | Histórico do paciente (somente leitura) ao abrir um paciente da lista | roadmap bloco 6 |

**Riscos:** é a maior peça do plano — com 5-10h/semana pode estourar a
semana. Se estourar, cortar o histórico detalhado (P1) pro Sprint 6 e manter
só a listagem com indicador de risco (P0) aqui.
**Definição de pronto:** médico logado vê pacientes reais vinculados a ele,
com indicador de risco calculado a partir dos dados de verdade.

---

## Sprint 6 — Anotações clínicas e fechamento pra homologação
**Objetivo:** médico registra uma observação sobre o paciente; sistema está
estável o bastante pra chamar os primeiros participantes reais.

| Prioridade | Item | Origem |
|---|---|---|
| P0 | Anotação clínica (criar + listar, vinculada ao `patient_doctor_link`) | roadmap bloco 6 (RF09) |
| P0 | Histórico do paciente somente leitura pro médico, se ficou pendente do Sprint 5 | roadmap bloco 6 |
| P1 | Checklist LGPD rápido (nada de dado sensível logado em texto claro, etc.) | roadmap bloco 8 (RNF03) |
| P1 | Checklist de acessibilidade básica (contraste, tamanho de toque, textos) | roadmap bloco 8 (RNF05) |
| P1 | Rodar os dois fluxos completos do zero (paciente e médico) caçando bugs | — |

**Definição de pronto:** fluxo completo — cadastro → vínculo → registro →
visualização → anotação médica — funciona sem travar. Dá pra convidar os
primeiros participantes da amostra (até 20, conforme `specs/01`).

---

## Backlog pós-homologação (fora do corte acima)

Não bloqueiam o início dos testes de usabilidade — fazer depois, ou em
paralelo se sobrar tempo:

- RF08 — Exportação de relatório em PDF
- RF12 — Feedbacks motivacionais
- Login social via Google (falta Client ID/Secret)
- Filtros de período no gráfico (mensal/trimestral)
- Refino visual do Header/Navbar (hoje só os ícones foram trocados pra
  lucide-react — o layout/cores ainda são os antigos, pré-specs)
- Tela de perfil completa (hoje ainda é placeholder)

## Resumo

6 sprints de 1 semana ≈ **6 semanas de calendário** até "pronto pra
homologação", assumindo 5-10h/semana sem imprevistos grandes. É uma
estimativa, não uma promessa — recalibrar depois do Sprint 2 com a
velocidade real observada.
