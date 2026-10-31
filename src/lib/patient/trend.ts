const MIN_READINGS_PER_PERIOD = 3;
const MIN_DEVIATION_MGDL = 20;

export type DayPeriod = "MADRUGADA" | "MANHA" | "TARDE" | "NOITE";

export type TrendAlert = {
  period: DayPeriod;
  direction: "ALTA" | "BAIXA";
  /** Média do período apontado e média geral da janela — a base numérica
   * da análise, pra poder mostrar "como o sistema chegou nisso". */
  periodAverage: number;
  overallAverage: number;
  /** As medições que entraram na conta do período apontado, mais recente
   * primeiro — pra poder listar "em quais dias". */
  readings: { valueMgdl: number; measuredAt: Date }[];
} | null;

function periodForHour(hour: number): DayPeriod {
  if (hour < 6) return "MADRUGADA";
  if (hour < 12) return "MANHA";
  if (hour < 18) return "TARDE";
  return "NOITE";
}

/** Detecta se a glicose do paciente costuma ser mais alta ou mais baixa num
 * período específico do dia, dado um recorte de registros (tipicamente os
 * últimos 30 dias, mesma janela do card de motivação). Regra confirmada com
 * o Glauber em 2026-09-06: um período só conta com pelo menos 3 medições, e
 * só vira alerta se o desvio da média do período em relação à média geral
 * for de pelo menos 20 mg/dL. Mostra só o período mais desviante. */
export function detectGlucoseTrend(
  records: { valueMgdl: number; measuredAt: Date }[]
): TrendAlert {
  if (records.length === 0) return null;

  const overallAvg =
    records.reduce((sum, record) => sum + record.valueMgdl, 0) /
    records.length;

  const sumsByPeriod = new Map<DayPeriod, { sum: number; count: number }>();
  for (const record of records) {
    const period = periodForHour(record.measuredAt.getHours());
    const bucket = sumsByPeriod.get(period) ?? { sum: 0, count: 0 };
    bucket.sum += record.valueMgdl;
    bucket.count += 1;
    sumsByPeriod.set(period, bucket);
  }

  let best: { period: DayPeriod; deviation: number; periodAvg: number } | null =
    null;
  for (const [period, { sum, count }] of sumsByPeriod) {
    if (count < MIN_READINGS_PER_PERIOD) continue;
    const periodAvg = sum / count;
    const deviation = periodAvg - overallAvg;
    if (!best || Math.abs(deviation) > Math.abs(best.deviation)) {
      best = { period, deviation, periodAvg };
    }
  }

  if (!best || Math.abs(best.deviation) < MIN_DEVIATION_MGDL) {
    return null;
  }

  const readings = records
    .filter((record) => periodForHour(record.measuredAt.getHours()) === best.period)
    .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime());

  return {
    period: best.period,
    direction: best.deviation > 0 ? "ALTA" : "BAIXA",
    periodAverage: best.periodAvg,
    overallAverage: overallAvg,
    readings,
  };
}

const PERIOD_LABEL: Record<DayPeriod, string> = {
  MADRUGADA: "de madrugada",
  MANHA: "de manhã",
  TARDE: "à tarde",
  NOITE: "à noite",
};

export function trendAlertLabel(alert: TrendAlert): string | null {
  if (!alert) return null;
  const periodLabel = PERIOD_LABEL[alert.period];
  return alert.direction === "ALTA"
    ? `Notamos que sua glicose costuma subir ${periodLabel}. Fique de olho!`
    : `Notamos que sua glicose costuma cair ${periodLabel}. Fique de olho!`;
}

/** Explica a base numérica da análise — responde "como o sistema chegou
 * nisso": quantas medições, média do período apontado vs. média geral,
 * na janela dos últimos 30 dias. */
export function trendAlertDetail(alert: TrendAlert): string | null {
  if (!alert) return null;
  const periodLabel = PERIOD_LABEL[alert.period];
  return (
    `Nos últimos 30 dias, ${alert.readings.length} medições ${periodLabel} ` +
    `tiveram média de ${Math.round(alert.periodAverage)} mg/dL, contra uma ` +
    `média geral de ${Math.round(alert.overallAverage)} mg/dL nos seus registros.`
  );
}
