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

## Sprint 4 — Vínculo paciente-médico ✅ concluído
**Objetivo:** um médico gera um código, um paciente usa esse código pra se
vincular a ele.

| Prioridade | Item | Origem | Status |
|---|---|---|---|
| P0 | Médico gera código de convite | roadmap bloco 5 (RF10) | ✅ |
| P0 | Paciente consome código de convite | roadmap bloco 5 (RF10) | ✅ |
| P1 | Paciente vê a quem está vinculado / pode revogar | — | ✅ |

**Mudança de schema**: `patient_doctor_links.patient_id` virou nullable e
`invite_code` ganhou `unique` — o fluxo real precisa do médico gerar um
código antes de saber qual paciente vai consumi-lo. Detalhes e justificativa
em `04-modelo-de-dados.md`. Migração `20260903034632_...` escrita à mão
porque `prisma migrate dev` recusa rodar em terminal não-interativo nesta
versão — usei `prisma migrate deploy` pra aplicar.

**Onde ficou a UI**: dentro do próprio `/dashboard` (paciente: card "Vínculo
com médico"; médico: card "Vincular paciente" + lista de pacientes
vinculados), não em `/userConfig` — o mockup não define uma tela específica
pra isso (`06-fluxos-e-telas.md` só diz "tela/ação" genérica), e a tela de
perfil real (bloco 4 do roadmap) ainda não foi construída. A listagem de
pacientes vinculados do médico aqui é só uma lista simples — o painel
completo com indicador de risco é o Sprint 5.

**Regra de produto**: um paciente só pode ter um vínculo `active` por vez
(precisa revogar antes de usar outro código) — não estava em nenhuma spec
anterior, decisão registrada em `04-modelo-de-dados.md`.

**Definição de pronto:** ✅ testado ponta a ponta com médico e paciente de
teste reais — médico gera código, paciente consome (rejeita código
inexistente com mensagem clara), vínculo aparece nos dois dashboards
(`status = active`), paciente revoga e ambos os lados voltam ao estado sem
vínculo. Testado em modo produção.

---

## Sprint 5 — Painel do médico ✅ concluído
**Objetivo:** médico loga e vê os pacientes vinculados, com destaque pra quem
está em risco.

| Prioridade | Item | Origem | Status |
|---|---|---|---|
| P0 | Rota/layout exclusivo do médico | roadmap bloco 6 (RF06) | ✅ |
| P0 | Listagem de pacientes vinculados | roadmap bloco 6 (RF06) | ✅ |
| P0 | Indicador visual de risco (usa os limites do Sprint 3) | roadmap bloco 6 (RF07) | ✅ |
| P1 | Histórico do paciente (somente leitura) ao abrir um paciente da lista | roadmap bloco 6 | ✅ |

Coube tudo numa sprint só — não estourou como o risco previa, porque grande
parte da UI (gráfico, card de HbA1c, lista de histórico) já existia dos
Sprints 3/4 e só precisou virar componente reaproveitável
(`HbA1cCard`, `HistoricoList`, `src/lib/patient/history.ts`) em vez de
código novo do zero.

**Decisões tomadas sem pausar pra perguntar** (técnicas, não clínicas —
dentro do padrão já estabelecido nos sprints anteriores):
- Janela de "risco recente" = últimos 7 dias, mesma da tendência semanal —
  registrado em `02-requisitos-funcionais.md`.
- Sem rota `/medico` separada — `/dashboard` já diverge 100% por `role`
  desde o Sprint 4; criar um path novo só adicionaria lógica de
  redirecionamento pós-login sem mudar o comportamento real.
- Histórico do médico em `/dashboard/pacientes/[patientId]`, protegido pelo
  mesmo matcher do middleware (`/dashboard/:path*`) — não precisou tocar em
  `middleware.ts`.

**Definição de pronto:** ✅ testado ponta a ponta com um médico e dois
pacientes de teste (um com hipoglicemia grave nos últimos 7 dias, outro só
com valores normais) — listagem mostra o badge de risco só no paciente
certo, com o rótulo certo; abrir o paciente mostra HbA1c/gráfico/histórico
reais dele; tentar abrir um paciente **não vinculado** (id inventado) dá
404; um **paciente** tentando abrir a rota do médico não vê nenhum dado
(sem vazamento). Testado em modo produção.

---

## Sprint 6 — Anotações clínicas e fechamento pra homologação ✅ concluído
**Objetivo:** médico registra uma observação sobre o paciente; sistema está
estável o bastante pra chamar os primeiros participantes reais.

| Prioridade | Item | Origem | Status |
|---|---|---|---|
| P0 | Anotação clínica (criar + listar, vinculada ao `patient_doctor_link`) | roadmap bloco 6 (RF09) | ✅ |
| P0 | Histórico do paciente somente leitura pro médico, se ficou pendente do Sprint 5 | roadmap bloco 6 | ✅ (já tinha ficado pronto no Sprint 5) |
| P1 | Checklist LGPD rápido (nada de dado sensível logado em texto claro, etc.) | roadmap bloco 8 (RNF03) | ✅ |
| P1 | Checklist de acessibilidade básica (contraste, tamanho de toque, textos) | roadmap bloco 8 (RNF05) | ✅ |
| P1 | Rodar os dois fluxos completos do zero (paciente e médico) caçando bugs | — | ✅ |

**Decisão tomada com o Glauber em 2026-09-03**: anotação clínica é visível só
para o médico que a escreveu, não para o paciente — registrado em
`02-requisitos-funcionais.md`.

### Checklist LGPD (RNF03) — achados

- Sem `console.log`/`console.error` em nenhum arquivo de `src/` — conferido
  por busca no código inteiro.
- `.env` está no `.gitignore`; só `.env.example` é versionado, e não contém
  segredo real (placeholder pro `AUTH_SECRET`, credenciais padrão de
  Postgres local).
- `authorize` do Auth.js (`src/lib/auth/config.ts`) retorna só
  `id`/`name`/`email`/`role` pro NextAuth — `passwordHash` nunca sai da
  função, nunca chega no JWT/sessão.
- `registerUser`/`authenticate` (`src/lib/auth/actions.ts`) nunca retornam
  objeto de usuário pro client, só `string | undefined` — sem risco de
  vazar `passwordHash` na resposta de uma server action.
- Toda leitura de dado clínico por médico (glicose, refeição, HbA1c,
  anotação) passa por uma checagem de vínculo `ACTIVE` antes de tocar no
  banco — testado com tentativa de acesso direto (id de paciente não
  vinculado → 404; troca de sessão pra tentar chamar a server action de
  anotação como paciente → rejeitado com "Não autorizado.", nada é criado).
- Nenhum achado bloqueante. Não avaliado ainda (fora do MVP/homologação):
  criptografia em repouso a nível de coluna (hoje depende só da criptografia
  do disco/Postgres), política de retenção de dados.

### Checklist de acessibilidade (RNF05) — achados

- Todas as mensagens de erro de formulário usam `role="alert"` — paridade
  entre os componentes novos (Sprint 4/5/6) e os antigos (Sprint 1/2).
- Indicadores de risco/alerta (badges de hipo/hiperglicemia) sempre vêm com
  **texto**, nunca só cor — não depende de percepção de cor pra entender o
  alerta.
- Labels (`<Label htmlFor>`) associados a todo campo de formulário novo.
- **Achado, não bloqueante**: o `Button` padrão do shadcn (`size="default"`)
  tem `h-9` (36px) de altura — abaixo da recomendação de 44px de alvo de
  toque (WCAG 2.5.5, nível AAA, mas relevante pro público-alvo do RNF05:
  idosos/baixo letramento digital). É um padrão herdado desde o Sprint 1
  (botões de Login/Cadastro já usavam esse tamanho) — mudar agora é uma
  decisão de design system que afeta toda a base já aprovada visualmente,
  não só o Sprint 6. Registrado como item de backlog, não corrigido sem
  validar com o Glauber antes.

### Fluxo completo do zero — achados

Rodado com contas criadas via **cadastro real** (não seed direto no banco,
diferente dos testes de sprints anteriores): paciente e médico se
cadastram → médico gera código → paciente vincula → glicemia registrada do
paciente aparece no indicador de risco do médico → médico abre o histórico
do paciente e salva uma anotação clínica. Nenhum bug encontrado — é a
primeira vez que as features dos Sprints 1–6 rodam encadeadas na mesma
sessão, e não só isoladas com dados semeados a cada sprint.

**Definição de pronto:** ✅ fluxo completo — cadastro → vínculo → registro →
visualização → anotação médica — funciona sem travar. Dá pra convidar os
primeiros participantes da amostra (até 20, conforme `specs/01`).

---

## MVP pronto para homologação

RF01–RF07, RF09, RF10 e RF11 (todos os itens da "Definição de pronto pra
homologação" no topo deste arquivo, com RF04 parcial — só gráfico semanal,
o que já é o padrão do MVP definido lá) estão implementados e testados
ponta a ponta. 6 sprints, como estimado. Gaps conhecidos e deliberados pra
depois da homologação: RF08 (PDF), RF12 (motivacional), Google OAuth,
limites de hipo/hiper configuráveis por paciente, tela de perfil real,
tamanho de toque dos botões (ver checklist de acessibilidade acima).

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
- Tamanho de toque dos botões (36px hoje, recomendação é 44px) — ver
  checklist de acessibilidade do Sprint 6
- Limites de hipo/hiperglicemia configuráveis por paciente (hoje são
  globais em `src/lib/patient/glucose.ts`)

## Resumo

Os 6 sprints planejados aqui estão **concluídos**. O ritmo real não seguiu o
calendário de 1 semana por sprint estimado no início — coube tudo numa única
sessão de trabalho contínua em 2026-09-03. MVP cumpre a definição de pronto
pra homologação — ver "MVP pronto para homologação" acima.
