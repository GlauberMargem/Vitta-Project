# Modelo de Dados (PostgreSQL)

**ORM: Prisma** (confirmado). Tipagem gerada automática, integra com TypeScript +
Next.js API Routes, migrations declarativas.

## Entidades

### `users`
Conta genérica, base para os dois perfis.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid PK | |
| name | text | |
| email | text unique | |
| password_hash | text | nullable se login só via OAuth |
| role | enum('patient','doctor') | define qual profile table consultar |
| created_at | timestamptz | |

### `patient_profiles`
1:1 com `users` onde `role = 'patient'`.

| Campo | Tipo | Observação |
|---|---|---|
| user_id | uuid PK/FK → users.id | |
| birth_date | date | |
| diabetes_type | enum('tipo_1','tipo_2','gestacional','outro') | |
| hypo_threshold | integer, default 70 | RF05 — editável pelo paciente, ver seção abaixo |
| severe_hypo_threshold | integer, default 54 | RF05 — editável pelo paciente |
| hyper_fasting_threshold | integer, default 130 | RF05 — jejum/antes de dormir, editável pelo paciente |
| hyper_postprandial_threshold | integer, default 180 | RF05 — pós-prandial/outro, editável pelo paciente |

### `doctor_profiles`
1:1 com `users` onde `role = 'doctor'`.

| Campo | Tipo | Observação |
|---|---|---|
| user_id | uuid PK/FK → users.id | |
| crm | text | número do CRM |
| specialty | text | RQE / especialidade |

### `glucose_records`
Registro de glicemia — RF02/RF03/RF04/RF05/RF11.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid PK | |
| patient_id | uuid FK → patient_profiles.user_id | índice |
| value_mgdl | integer | valor em mg/dL |
| context | enum('jejum','pos_prandial','antes_de_dormir','outro') | |
| measured_at | timestamptz | índice, usado nos gráficos e na média de 90 dias |
| created_at | timestamptz | quando o registro foi salvo no sistema |

## Limites clínicos de hipo/hiperglicemia (RF05)

Fonte: diretrizes oficiais da Sociedade Brasileira de Diabetes (SBD), trazidas
pelo Glauber em 2026-09-03:
- [Metas de controle glicêmico](https://diretriz.diabetes.org.br/metas-de-controle-glicemico/)
- [Manejo da hiperglicemia hospitalar em pacientes não críticos](https://diretriz.diabetes.org.br/manejo-da-hiperglicemia-hospitalar-em-pacientes-nao-criticos/)
  (usada só como referência complementar — o MVP não é ambiente hospitalar)

**Hipoglicemia** (vale para qualquer contexto de medição):
- Nível 1 — 54 a 69 mg/dl: já clinicamente relevante, mesmo sem sintomas.
- Nível 2 — < 54 mg/dl: grave, exige intervenção imediata.
- Nível 3 (alteração de estado mental, independente do valor) não é
  detectável a partir só do valor numérico — fora do escopo do alerta
  automático do MVP.
- **Regra de alerta do app**: `value_mgdl < 70` → hipoglicemia (usa o limite
  superior do Nível 1 como corte único; a UI pode diferenciar visualmente
  quando `< 54`, ver `08-design-system.md`).

**Hiperglicemia** — meta de acompanhamento ambulatorial (não hospitalar) para
a maioria dos adultos: jejum 80–130 mg/dl, pós-prandial (2h) < 180 mg/dl.
Mapeamento por `context` de `glucose_records`, decidido com o Glauber em
2026-09-03:

| `context` | Regra de alerta de hiperglicemia |
|---|---|
| `jejum` | `value_mgdl > 130` |
| `antes_de_dormir` | `value_mgdl > 130` (tratado como jejum prolongado — a diretriz não define meta própria pra esse horário) |
| `pos_prandial` | `value_mgdl >= 180` |
| `outro` | `value_mgdl >= 180` (limite mais permissivo do pós-prandial, por não saber a que refere-se a medição) |

Os valores hospitalares (>140 de alerta geral, >180 pra intervenção
farmacológica) **não** se aplicam aqui — são de outro contexto clínico
(paciente internado) e foram descartados para o MVP ambulatorial.

**Configurável por paciente (backlog pós-homologação, 2026-09-05)**: os 4
valores acima (`hypo_threshold`, `severe_hypo_threshold`,
`hyper_fasting_threshold`, `hyper_postprandial_threshold`) viraram colunas
em `patient_profiles`, com os valores da literatura como default. Decisão do
Glauber: usar a literatura como base e permitir que o paciente ajuste
(ex.: médico recomendou uma meta mais rígida ou mais permissiva pro caso
dele). Editável em `/userConfig`, com opção de restaurar o padrão. Validação
de aplicação (não é regra clínica nova): inteiros entre 50-500 mg/dL (mesmo
domínio do eixo Y do gráfico) e ordem coerente (`severe_hypo_threshold` <
`hypo_threshold` < cada limite de hiperglicemia). `glucoseAlert` deixou de
ter um limite global implícito — toda tela que calcula alerta busca os
limites do `patient_profiles` da pessoa certa.

## Estimativa de HbA1c (RF11)

Fórmula do estudo ADAG (*A1c-Derived Average Glucose*): Nathan DM, Kuenen J,
Borg R, Zheng H, Schoenfeld D, Heine RJ; A1c-Derived Average Glucose Study
Group. "Translating the A1C assay into estimated average glucose values."
*Diabetes Care*. 2008;31(8):1473-8.

```
HbA1c (%) = (glicemia média em mg/dL dos últimos 90 dias + 46,7) ÷ 28,7
```

Glicemia média = média simples de `value_mgdl` de todos os `glucose_records`
do paciente com `measured_at` nos últimos 90 dias. Sem registros no período,
não há estimativa a exibir (não mostrar card de HbA1c, não mostrar `0%`).

**Meta de referência exibida junto à estimativa**: `< 7%`, meta geral
ADA/SBD para a maioria dos adultos com diabetes — confirmado com o Glauber em
2026-09-03. Não considera ajuste por idade/comorbidade (ex.: idosos com meta
mais frouxa) — o MVP não modela isso ainda.

⚠️ É uma **estimativa** a partir de registros manuais do paciente, não um
resultado de exame laboratorial — a UI precisa deixar isso explícito (rótulo
"estimativa", não "seu HbA1c").

### `meals`
Registro de refeição — contexto para variações glicêmicas.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid PK | |
| patient_id | uuid FK → patient_profiles.user_id | |
| name | text | opcional, refeição "salva" reutilizável |
| carbs_g | integer | quantidade de carboidratos |
| eaten_at | timestamptz | |

### `patient_doctor_links`
Vínculo opcional paciente↔médico — RF10.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid PK | |
| patient_id | uuid FK → patient_profiles.user_id, **nullable** | nulo até o código ser consumido |
| doctor_id | uuid FK → doctor_profiles.user_id | |
| invite_code | text, unique | gerado pelo médico, consumido pelo paciente |
| status | enum('pending','active','revoked') | |
| created_at | timestamptz | |

**Desvio do modelo original** (2026-09-03, Sprint 4): `patient_id` mudou de
obrigatório para nullable. Motivo: o fluxo real (RF10, `06-fluxos-e-telas.md`)
é o médico gerar um código **sem saber ainda qual paciente vai usá-lo** — a
linha nasce com `status = 'pending'` e `patient_id = null`; quando um
paciente consome o código, a mesma linha ganha `patient_id` e vira `status =
'active'`. Um `patient_id` obrigatório desde a criação não permitiria
representar o código pendente. `invite_code` ganhou `unique` pra a busca do
paciente por código ser direta e sem ambiguidade.

Regra: um paciente só pode ter **um vínculo `active` por vez** — se já tiver
um, precisa revogar antes de consumir outro código (decisão de produto, não
está em nenhuma spec anterior — o app é descrito como "vínculo a **um**
médico", não vários simultâneos).

Regra: toda leitura de dados de paciente pelo médico (RF06/RF07/RF09) deve passar
por `WHERE status = 'active'` neste vínculo — nunca acesso direto por `patient_id`.

### `clinical_notes`
Anotação clínica do médico — RF09. Entidade separada dos dados do paciente.

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid PK | |
| link_id | uuid FK → patient_doctor_links.id | garante que só existe se houver vínculo ativo |
| doctor_id | uuid FK → doctor_profiles.user_id | |
| note | text | |
| created_at | timestamptz | |

## Índices essenciais (RNF06)

- `glucose_records (patient_id, measured_at)`
- `meals (patient_id, eaten_at)`
- `patient_doctor_links (doctor_id, status)`
- `patient_doctor_links (patient_id, status)`

## Fora do MVP de dados (não criar tabela ainda)

- Notificações push (RF12 é motivacional simples, calculável on-the-fly a partir de
  `glucose_records`, não precisa de tabela própria no MVP).
