# Requisitos Funcionais

| Código | Descrição | Usuário | Prioridade | Status |
|---|---|---|---|---|
| RF01 | Cadastro e autenticação de usuários (paciente e médico) com perfis de acesso distintos | Ambos | Alta | ✅ concluído (Sprint 1) |
| RF02 | Paciente registra medição de glicose: valor (mg/dL), data, horário, contexto (jejum, pós-prandial, antes de dormir) | Paciente | Alta | ✅ concluído (Sprint 2) |
| RF03 | Histórico cronológico das medições do paciente | Paciente | Alta | ✅ concluído (Sprint 2) |
| RF04 | Gráficos de tendência glicêmica (diária, semanal, mensal) | Paciente | Alta | ✅ concluído — semanal desde o Sprint 3, diária/mensal implementadas pós-homologação (seletor de período) |
| RF05 | Alertas visuais quando registro está fora dos limites de referência (hipo/hiperglicemia) | Paciente | Alta | ✅ concluído (Sprint 3; limites configuráveis por paciente desde 2026-09-05) |
| RF06 | Médico visualiza painel com lista de pacientes vinculados e históricos | Médico | Alta | ✅ concluído (Sprint 5) |
| RF07 | Médico identifica pacientes em risco por indicadores visuais no painel | Médico | Alta | ✅ concluído (Sprint 5) |
| RF08 | Relatório glicêmico exportável em PDF | Ambos | Média | ✅ concluído (pós-homologação, 2026-09-05) |
| RF09 | Médico adiciona anotações clínicas ao histórico do paciente vinculado | Médico | Média | ✅ concluído (Sprint 6) |
| RF10 | Paciente vincula-se a um médico via código de convite | Paciente | Média | ✅ concluído (Sprint 4) |
| RF11 | Cálculo/exibição de estimativa de HbA1c com base na média dos últimos 90 dias | Paciente | Média | ✅ concluído (Sprint 3) |
| RF12 | Feedbacks motivacionais com base na consistência dos registros | Paciente | Baixa | ✅ concluído (pós-homologação, 2026-09-05) |

Regras de negócio associadas (não repetir no código como comentário — só aplicar):

- RF02/RF03: registro é sempre de propriedade exclusiva do paciente; nenhum outro
  ator pode criar/editar essas linhas (nem o médico vinculado).
- RF06/RF07: o médico só enxerga pacientes com vínculo ativo (ver RF10); nunca lista
  todos os pacientes do sistema.
- RF07: "recentemente" (fora dos limites de referência) definido como **últimos 7
  dias** — mesma janela do gráfico semanal (RF04). Decisão de UX registrada em
  2026-09-03, não é um valor clínico da SBD.
- RF04: janelas do gráfico — "diária" mostra os registros do dia corrente sem
  média (cada aferição é um ponto, pra ver a variação intradiária); "semanal" é a
  semana corrente (segunda a domingo), média por dia; "mensal" são os últimos 30
  dias corridos, média por dia. Nenhuma é um mês-calendário — decisão de
  implementação, não um valor clínico.
- RF08: relatório em PDF usa as mesmas três janelas de período do RF04 (dia/
  semana/mês) — `getPeriodRange` em `glucose.ts` é compartilhada pelos dois.
  Conteúdo confirmado com o Glauber em 2026-09-05: tabela com todos os
  registros de glicose/refeição do período (sem limite de linhas, diferente do
  histórico recente que mostra só os 10 últimos) + resumo de HbA1c estimado.
  Sem o gráfico embutido como imagem — decisão de simplicidade técnica.
  Gerado inteiramente no navegador (client-side, `jsPDF`), sem rota de API.
- RF05: limites de hipo/hiperglicemia configuráveis por paciente desde
  2026-09-05 (backlog pós-homologação) — literatura SBD como padrão, o
  paciente pode ajustar em `/userConfig`. Ver `04-modelo-de-dados.md` e
  `09-sprints.md`.
- RF12: "consistência dos registros" definida (confirmado com o Glauber em
  2026-09-05) como número de dias distintos, dentre os últimos 7 dias corridos
  (hoje + 6 anteriores), com pelo menos um registro **de glicose** — refeição
  não conta. Essa janela é própria do RF12 (`countDaysWithGlucoseRecord` em
  `motivation.ts`), diferente da semana corrente do gráfico (segunda a
  domingo) e da janela rolante em horas do indicador de risco do médico
  (RF07) — as três representam "7 dias" de formas ligeiramente diferentes,
  cada uma com um motivo de UX próprio, nenhuma é valor clínico. Textos das
  5 faixas de mensagem (0, 1–2, 3–4, 5–6, 7 dias) confirmados literalmente
  com o Glauber — não parafrasear, ver `motivation.ts`.
- RF09: anotação clínica é uma entidade separada dos registros de glicose/refeição
  do paciente — não deve ser confundida ou misturada no mesmo histórico.
- RF09: anotação clínica é visível **só para o médico que a escreveu** — decisão
  confirmada com o Glauber em 2026-09-03 (não estava definido em spec anterior).
  Paciente não tem acesso a essas notas em nenhuma tela.
- RF10: vínculo é sempre iniciado pelo **paciente** informando um código gerado pelo
  médico (não o médico buscando/adicionando paciente livremente).
