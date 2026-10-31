const DAYS_IN_WINDOW = 7;

/** Últimos 7 dias corridos (hoje + 6 anteriores) — janela própria do RF12,
 * diferente da semana corrente do gráfico (segunda a domingo) e da janela
 * rolante em horas do indicador de risco do médico (RF07). Definida assim
 * pra garantir uma escala fechada de 0 a 7 dias possíveis. */
function getLast7CalendarDaysRange(referenceDate: Date): {
  start: Date;
  end: Date;
} {
  const end = new Date(referenceDate);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);
  const start = new Date(end);
  start.setDate(start.getDate() - DAYS_IN_WINDOW);
  return { start, end };
}

/** Conta dias distintos (não registros) com pelo menos uma glicose nos
 * últimos 7 dias corridos — "consistência dos registros" do RF12. */
export function countDaysWithGlucoseRecord(
  glucoseRecords: { measuredAt: Date }[],
  referenceDate: Date = new Date()
): number {
  const { start, end } = getLast7CalendarDaysRange(referenceDate);
  const days = new Set<string>();
  for (const record of glucoseRecords) {
    if (record.measuredAt >= start && record.measuredAt < end) {
      days.add(record.measuredAt.toISOString().slice(0, 10));
    }
  }
  return days.size;
}

/** Textos confirmados com o Glauber em 2026-09-05 — não parafrasear. */
export function motivationalMessage(daysWithRecords: number): string {
  if (daysWithRecords >= 7) {
    return "Você registrou sua glicose todos os dias essa semana. Continue assim!";
  }
  if (daysWithRecords >= 5) {
    return "Você já registrou sua glicose em quase todos os dias dessa semana. Muito bom!";
  }
  if (daysWithRecords >= 3) {
    return "Você registrou sua glicose em alguns dias dessa semana. Cada registro ajuda a entender melhor sua saúde.";
  }
  if (daysWithRecords >= 1) {
    return "Você começou a registrar sua glicose essa semana. Continuar, mesmo aos poucos, já faz diferença.";
  }
  return "Você ainda não registrou nenhuma glicose essa semana. Que tal começar agora?";
}
