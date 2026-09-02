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
| patient_id | uuid FK → patient_profiles.user_id | |
| doctor_id | uuid FK → doctor_profiles.user_id | |
| invite_code | text | gerado pelo médico, consumido pelo paciente |
| status | enum('pending','active','revoked') | |
| created_at | timestamptz | |

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
