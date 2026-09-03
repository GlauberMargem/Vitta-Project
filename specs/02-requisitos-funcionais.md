# Requisitos Funcionais

| Código | Descrição | Usuário | Prioridade | Status |
|---|---|---|---|---|
| RF01 | Cadastro e autenticação de usuários (paciente e médico) com perfis de acesso distintos | Ambos | Alta | ✅ concluído (Sprint 1) |
| RF02 | Paciente registra medição de glicose: valor (mg/dL), data, horário, contexto (jejum, pós-prandial, antes de dormir) | Paciente | Alta | ✅ concluído (Sprint 2) |
| RF03 | Histórico cronológico das medições do paciente | Paciente | Alta | ✅ concluído (Sprint 2) |
| RF04 | Gráficos de tendência glicêmica (diária, semanal, mensal) | Paciente | Alta | 🟡 parcial (Sprint 3) — só semanal, diária/mensal ficam pro backlog pós-homologação |
| RF05 | Alertas visuais quando registro está fora dos limites de referência (hipo/hiperglicemia) | Paciente | Alta | ✅ concluído (Sprint 3) |
| RF06 | Médico visualiza painel com lista de pacientes vinculados e históricos | Médico | Alta | ✅ concluído (Sprint 5) |
| RF07 | Médico identifica pacientes em risco por indicadores visuais no painel | Médico | Alta | ✅ concluído (Sprint 5) |
| RF08 | Relatório glicêmico exportável em PDF | Ambos | Média | ❌ não iniciado |
| RF09 | Médico adiciona anotações clínicas ao histórico do paciente vinculado | Médico | Média | ❌ não iniciado |
| RF10 | Paciente vincula-se a um médico via código de convite | Paciente | Média | ✅ concluído (Sprint 4) |
| RF11 | Cálculo/exibição de estimativa de HbA1c com base na média dos últimos 90 dias | Paciente | Média | ✅ concluído (Sprint 3) |
| RF12 | Feedbacks motivacionais com base na consistência dos registros | Paciente | Baixa | ❌ não iniciado |

Regras de negócio associadas (não repetir no código como comentário — só aplicar):

- RF02/RF03: registro é sempre de propriedade exclusiva do paciente; nenhum outro
  ator pode criar/editar essas linhas (nem o médico vinculado).
- RF06/RF07: o médico só enxerga pacientes com vínculo ativo (ver RF10); nunca lista
  todos os pacientes do sistema.
- RF07: "recentemente" (fora dos limites de referência) definido como **últimos 7
  dias** — mesma janela do gráfico semanal (RF04). Decisão de UX registrada em
  2026-09-03, não é um valor clínico da SBD.
- RF09: anotação clínica é uma entidade separada dos registros de glicose/refeição
  do paciente — não deve ser confundida ou misturada no mesmo histórico.
- RF10: vínculo é sempre iniciado pelo **paciente** informando um código gerado pelo
  médico (não o médico buscando/adicionando paciente livremente).
