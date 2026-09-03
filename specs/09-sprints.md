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

## Sprint 1 — Cadastro e guarda de rota ✅ concluído
**Objetivo:** qualquer pessoa cria conta (paciente ou médico) e, ao logar, cai
automaticamente na área certa; quem não está logado não acessa a área logada.

| Prioridade | Item | Origem | Status |
|---|---|---|---|
| P0 | Cadastro etapa 1 (dados gerais + seletor Paciente/Médico) | roadmap bloco 1 | ✅ |
| P0 | Cadastro etapa 2 (paciente: nascimento + tipo de diabetes / médico: CRM + especialidade) | roadmap bloco 1 | ✅ |
| P0 | `middleware.ts`: bloqueia `(app)/*` sem sessão, redireciona pra `/login`; usuário já logado não vê `/login`/`/cadastro` de novo | roadmap bloco 1, `05-arquitetura.md` | ✅ |
| P1 | Validação de senha (confirmação, tamanho mínimo) | — | ✅ (mínimo 8 caracteres) |

**Riscos que viraram achados reais:**
- O arquivo é `middleware.ts`, não `proxy.ts` como o sprint original previa
  (a skill `next-best-practices` errou nesse ponto — corrigido e documentado
  em `05-arquitetura.md`).
- `middleware.ts` roda em Edge Runtime, e a config completa do Auth.js importa
  Prisma/`pg`, que não roda no Edge — precisou separar em
  `config.base.ts` (edge-safe) + `config.ts` (completo).
- **Bug confirmado no `next dev`** desta versão do Next (16.1.1): o
  middleware nunca é invocado em modo dev (nem com um `throw`
  incondicional), mas funciona perfeitamente em `next build && next start`.
  Testar guard de rota sempre em modo produção local até o Next ser
  atualizado.

**Definição de pronto:** ✅ testado ponta a ponta em modo produção — criar
conta paciente, criar conta médico, logar com as duas, email duplicado é
rejeitado, e um usuário deslogado é redirecionado ao tentar abrir
`/dashboard` direto pela URL. Ainda não existe área separada pro médico
(fica pro Sprint 5), então o guard por `role` específico ainda não se
aplica — só o guard geral "precisa estar logado".

---

## Sprint 2 — Registro de glicose e refeição ✅ concluído
**Objetivo:** paciente logado registra uma glicemia e uma refeição de
verdade, e vê isso no histórico.

| Prioridade | Item | Origem | Status |
|---|---|---|---|
| P0 | Criar/listar `glucose_records` (server action, não API route) | roadmap bloco 2 | ✅ |
| P0 | Criar/listar `meals` | roadmap bloco 2 | ✅ |
| P0 | Modal "Nova Glicose" ligado à API real | roadmap bloco 2 | ✅ |
| P0 | Modal "Nova Refeição" ligado à API real | roadmap bloco 2 | ✅ |
| P1 | Home do paciente exibindo histórico recente (lista simples, sem gráfico ainda) | roadmap bloco 2 | ✅ |

**Achado de teste:** os modais usam shadcn `Dialog` (Radix), que renderiza o
conteúdo num Portal — isso nunca aparece no HTML gerado no servidor,
independente do estado `open`. Pra testar as server actions ponta a ponta
sem navegador, criei uma página temporária com os formulários "nus" (sem o
Dialog por volta), testei via POST real, e apaguei a página depois. Os
componentes de produção (`NovaGlicoseDialog`, `NovaRefeicaoDialog`) não
foram alterados por causa disso.

**Definição de pronto:** ✅ testado ponta a ponta — glicose e refeição
criadas via as mesmas server actions dos modais, aparecem vinculadas ao
paciente certo no histórico do dashboard (confirmando que
`revalidatePath("/dashboard")` funciona), e valor de glicose inválido
(negativo) é rejeitado com mensagem de erro.

---

## Sprint 3 — Gráficos, HbA1c estimado e alertas ✅ concluído
**Objetivo:** dashboard do paciente mostra tendência glicêmica, estimativa de
HbA1c e destaca visualmente registros fora da faixa de referência.

| Prioridade | Item | Origem | Status |
|---|---|---|---|
| P0 | Componente de gráfico de área (semanal), dados reais | roadmap bloco 3 | ✅ |
| P0 | Cálculo e exibição de HbA1c estimado (média 90 dias) | roadmap bloco 3 (RF11) | ✅ |
| P0 | Alerta visual quando registro está fora dos limites | roadmap bloco 3 (RF05) | ✅ |
| P1 | Limites configuráveis (mesmo que só editável via banco por enquanto) | — | ❌ adiado |

**Gaps resolvidos com o Glauber em 2026-09-03**, com fonte documentada em
`04-modelo-de-dados.md` e `05-arquitetura.md`:
- Biblioteca de gráficos: Recharts via shadcn/ui Charts.
- Limites de hipo/hiperglicemia: diretrizes SBD (metas de controle
  glicêmico), mapeados por contexto do registro.
- Fórmula de estimativa de HbA1c: estudo ADAG (Nathan et al., 2008), meta de
  referência `<7%` (ADA/SBD, maioria dos adultos).

**Desvios deliberados:**
- Gráfico mostra os 7 dias da semana corrente (Seg a Dom), não só os 5 dias
  literalmente listados no mockup — ver `08-design-system.md`.
- Cor do alerta reaproveita `#FFB5A7` (Atenção/ação) já existente na paleta,
  não uma cor nova — token `--alert`/`--alert-foreground` em `globals.css`.
- P1 (limites configuráveis por paciente) adiado: os limites de hoje são
  globais no código (`src/lib/patient/glucose.ts`), não por paciente/idade.
  Sem tela de configuração ainda — não bloqueia a definição de pronto do
  RF05 (o alerta funciona com os limites clínicos padrão).

**Definição de pronto:** ✅ testado ponta a ponta — paciente de teste com
registros na semana corrente cobrindo hipoglicemia grave (<54), hipoglicemia
(54–69), hiperglicemia (jejum >130 e pós-prandial ≥180) e um valor normal;
dashboard mostrou a estimativa de HbA1c correta (fórmula ADAG conferida à
mão), o gráfico semanal com a média diária certa por dia, e o badge de
alerta certo (ou ausente) em cada item do histórico. Testado em modo
produção (`next build && next start`), servidor limpo reiniciado no meio do
teste pra eliminar dúvida sobre build obsoleto.

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
