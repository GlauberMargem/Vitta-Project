import type { GlucoseContext } from "@/generated/prisma/client";

/** Limites de hipo/hiperglicemia (RF05) — fontes em specs/04-modelo-de-dados.md
 * (diretrizes SBD). Usados como valor padrão em `PatientProfile`; o paciente
 * pode ajustar em `/userConfig` (backlog pós-homologação, ver 09-sprints.md). */
export type GlucoseThresholds = {
  hypo: number;
  severeHypo: number;
  hyperFasting: number;
  hyperPostprandial: number;
};

export const DEFAULT_GLUCOSE_THRESHOLDS: GlucoseThresholds = {
  hypo: 70,
  severeHypo: 54,
  hyperFasting: 130,
  hyperPostprandial: 180,
};

/** Converte as 4 colunas de `PatientProfile` pro formato usado pelas funções
 * de alerta — evita repetir esse mapeamento em cada página que lê o perfil. */
export function toGlucoseThresholds(profile: {
  hypoThreshold: number;
  severeHypoThreshold: number;
  hyperFastingThreshold: number;
  hyperPostprandialThreshold: number;
}): GlucoseThresholds {
  return {
    hypo: profile.hypoThreshold,
    severeHypo: profile.severeHypoThreshold,
    hyperFasting: profile.hyperFastingThreshold,
    hyperPostprandial: profile.hyperPostprandialThreshold,
  };
}

export function isHypoglycemia(
  valueMgdl: number,
  thresholds: GlucoseThresholds
): boolean {
  return valueMgdl < thresholds.hypo;
}

export function isSevereHypoglycemia(
  valueMgdl: number,
  thresholds: GlucoseThresholds
): boolean {
  return valueMgdl < thresholds.severeHypo;
}

export function isHyperglycemia(
  valueMgdl: number,
  context: GlucoseContext,
  thresholds: GlucoseThresholds
): boolean {
  switch (context) {
    case "JEJUM":
    case "ANTES_DE_DORMIR":
      return valueMgdl > thresholds.hyperFasting;
    case "POS_PRANDIAL":
    case "OUTRO":
      return valueMgdl >= thresholds.hyperPostprandial;
  }
}

export type GlucoseAlert =
  | "HIPOGLICEMIA_GRAVE"
  | "HIPOGLICEMIA"
  | "HIPERGLICEMIA"
  | null;

export function glucoseAlert(
  valueMgdl: number,
  context: GlucoseContext,
  thresholds: GlucoseThresholds
): GlucoseAlert {
  if (isSevereHypoglycemia(valueMgdl, thresholds)) return "HIPOGLICEMIA_GRAVE";
  if (isHypoglycemia(valueMgdl, thresholds)) return "HIPOGLICEMIA";
  if (isHyperglycemia(valueMgdl, context, thresholds)) return "HIPERGLICEMIA";
  return null;
}

/** Prioriza o alerta mais grave entre vários registros (RF07 — risco do paciente no painel do médico). */
export function mostSevereAlert(alerts: GlucoseAlert[]): GlucoseAlert {
  if (alerts.includes("HIPOGLICEMIA_GRAVE")) return "HIPOGLICEMIA_GRAVE";
  if (alerts.includes("HIPOGLICEMIA")) return "HIPOGLICEMIA";
  if (alerts.includes("HIPERGLICEMIA")) return "HIPERGLICEMIA";
  return null;
}

export function glucoseAlertLabel(alert: GlucoseAlert): string {
  switch (alert) {
    case "HIPOGLICEMIA_GRAVE":
      return "Hipoglicemia grave";
    case "HIPOGLICEMIA":
      return "Hipoglicemia";
    case "HIPERGLICEMIA":
      return "Hiperglicemia";
    default:
      return "";
  }
}

/** Fórmula ADAG (Nathan et al., Diabetes Care 2008) — ver specs/04-modelo-de-dados.md */
export function estimateHbA1c(records: { valueMgdl: number }[]): number | null {
  if (records.length === 0) return null;
  const average =
    records.reduce((sum, record) => sum + record.valueMgdl, 0) /
    records.length;
  return (average + 46.7) / 28.7;
}

export const HBA1C_TARGET_PERCENT = 7;

/** Valor a partir do qual a cor do card de HbA1c fica 100% laranja — decisão
 * do Glauber em 2026-09-06, usando a referência de alto risco da ADA
 * (>= 9%) com uma margem de transição até 10%. Abaixo da meta (7%), sempre
 * verde puro. */
const HBA1C_WORST_PERCENT = 10;
const HBA1C_GOOD_COLOR = { r: 0x4c, g: 0xaf, b: 0x50 }; // #4CAF50
const HBA1C_BAD_COLOR = { r: 0xff, g: 0xd6, b: 0xa5 }; // #FFD6A5 (pêssego pastel)

/** Interpola do verde (na meta ou melhor) ao laranja pastel (HBA1C_WORST_PERCENT
 * ou pior) — degradê pedido pelo Glauber em 2026-09-06 pro card de HbA1c. */
export function hba1cColor(value: number): string {
  const ratio = Math.min(
    1,
    Math.max(
      0,
      (value - HBA1C_TARGET_PERCENT) /
        (HBA1C_WORST_PERCENT - HBA1C_TARGET_PERCENT)
    )
  );
  const r = Math.round(
    HBA1C_GOOD_COLOR.r + (HBA1C_BAD_COLOR.r - HBA1C_GOOD_COLOR.r) * ratio
  );
  const g = Math.round(
    HBA1C_GOOD_COLOR.g + (HBA1C_BAD_COLOR.g - HBA1C_GOOD_COLOR.g) * ratio
  );
  const b = Math.round(
    HBA1C_GOOD_COLOR.b + (HBA1C_BAD_COLOR.b - HBA1C_GOOD_COLOR.b) * ratio
  );
  return `rgb(${r}, ${g}, ${b})`;
}

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHLY_WINDOW_DAYS = 30;

export type ReportPeriod = "daily" | "weekly" | "monthly";

/** Janela de datas [start, end) de cada período — usada pelos gráficos e pelo
 * relatório em PDF (RF04, RF08), pra não duplicar a definição de "semana
 * corrente"/"últimos 30 dias" em mais de um lugar. */
export function getPeriodRange(
  period: ReportPeriod,
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  if (period === "daily") {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (period === "weekly") {
    const start = new Date(referenceDate);
    const isoWeekday = (start.getDay() + 6) % 7; // 0 = segunda
    start.setDate(start.getDate() - isoWeekday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }

  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (MONTHLY_WINDOW_DAYS - 1));
  const end = new Date(referenceDate);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export type GlucosePoint = { label: string; value: number | null };

/** Semana corrente (segunda a domingo), média diária dos registros. */
export function buildWeeklyGlucoseSeries(
  records: { valueMgdl: number; measuredAt: Date }[],
  referenceDate: Date = new Date()
): GlucosePoint[] {
  const { start } = getPeriodRange("weekly", referenceDate);

  const buckets: number[][] = Array.from({ length: 7 }, () => []);

  for (const record of records) {
    const diffDays = Math.floor(
      (record.measuredAt.getTime() - start.getTime()) / 86_400_000
    );
    if (diffDays >= 0 && diffDays < 7) {
      buckets[diffDays].push(record.valueMgdl);
    }
  }

  return buckets.map((values, index) => ({
    label: WEEKDAY_LABELS[index],
    value: values.length
      ? Math.round(
          values.reduce((sum, value) => sum + value, 0) / values.length
        )
      : null,
  }));
}

/** Dia corrente, um ponto por registro (sem média) — mostra a variação intradiária. */
export function buildDailyGlucoseSeries(
  records: { valueMgdl: number; measuredAt: Date }[],
  referenceDate: Date = new Date()
): GlucosePoint[] {
  const { start, end } = getPeriodRange("daily", referenceDate);

  return records
    .filter((record) => record.measuredAt >= start && record.measuredAt < end)
    .sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())
    .map((record) => ({
      label: record.measuredAt.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: record.valueMgdl,
    }));
}

/** Últimos 30 dias (janela corrente), média diária dos registros. */
export function buildMonthlyGlucoseSeries(
  records: { valueMgdl: number; measuredAt: Date }[],
  referenceDate: Date = new Date()
): GlucosePoint[] {
  const { start } = getPeriodRange("monthly", referenceDate);

  const buckets: number[][] = Array.from(
    { length: MONTHLY_WINDOW_DAYS },
    () => []
  );

  for (const record of records) {
    const diffDays = Math.floor(
      (record.measuredAt.getTime() - start.getTime()) / 86_400_000
    );
    if (diffDays >= 0 && diffDays < MONTHLY_WINDOW_DAYS) {
      buckets[diffDays].push(record.valueMgdl);
    }
  }

  return buckets.map((values, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return {
      label: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      value: values.length
        ? Math.round(
            values.reduce((sum, value) => sum + value, 0) / values.length
          )
        : null,
    };
  });
}
