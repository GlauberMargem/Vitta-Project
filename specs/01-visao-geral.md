# Visão Geral

## Problema

Pacientes com Diabetes Mellitus têm dificuldade em manter o automonitoramento
glicêmico de forma constante, e a comunicação desses dados com o médico é
ineficiente (papel, planilhas soltas). Isso atrasa ajustes terapêuticos e aumenta o
risco de complicações crônicas.

## Objetivo

Um sistema web (Sistema Vitta) que permita ao paciente registrar e visualizar sua
glicemia de forma simples, e ao médico acompanhar múltiplos pacientes de forma
centralizada — reduzindo a assimetria de informação entre os dois.

## Personas

| Persona | Necessidade central |
|---|---|
| **Paciente** | Registrar glicose/refeição rápido, entender tendências sem interpretar números soltos, ser lembrado/motivado a manter o hábito. |
| **Médico** | Ver vários pacientes de uma vez, identificar quem está em risco sem precisar abrir cada histórico manualmente, anotar observações clínicas. |

## Escopo do MVP (TG-II)

Prioridade **Alta** (núcleo indispensável) — ver `02-requisitos-funcionais.md`:
cadastro/login com dois perfis, registro de glicose, histórico, gráficos de
tendência, alertas de hipo/hiperglicemia, painel do médico com lista de pacientes
e indicadores de risco.

Fora do MVP inicial (prioridade Média/Baixa, mas mapeado): exportação de relatório
em PDF, anotações clínicas do médico, vínculo paciente-médico por convite, cálculo
de HbA1c estimado, feedbacks motivacionais.

Explicitamente fora de escopo do Vitta: o médico **nunca** insere ou edita dados
clínicos do paciente — apenas visualiza e anota.
