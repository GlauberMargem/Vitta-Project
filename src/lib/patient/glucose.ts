import type { GlucoseContext } from "@/generated/prisma/client";

const HYPOGLYCEMIA_THRESHOLD_MGDL = 70;
const SEVERE_HYPOGLYCEMIA_THRESHOLD_MGDL = 54;

export function isHypoglycemia(valueMgdl: number): boolean {
  return valueMgdl < HYPOGLYCEMIA_THRESHOLD_MGDL;
}

export function isSevereHypoglycemia(valueMgdl: number): boolean {
  return valueMgdl < SEVERE_HYPOGLYCEMIA_THRESHOLD_MGDL;
}

export function isHyperglycemia(
  valueMgdl: number,
  context: GlucoseContext
): boolean {
  switch (context) {
    case "JEJUM":
    case "ANTES_DE_DORMIR":
      return valueMgdl > 130;
    case "POS_PRANDIAL":
    case "OUTRO":
      return valueMgdl >= 180;
  }
}

export type GlucoseAlert =
  | "HIPOGLICEMIA_GRAVE"
  | "HIPOGLICEMIA"
  | "HIPERGLICEMIA"
  | null;

export function glucoseAlert(
  valueMgdl: number,
  context: GlucoseContext
): GlucoseAlert {
  if (isSevereHypoglycemia(valueMgdl)) return "HIPOGLICEMIA_GRAVE";
  if (isHypoglycemia(valueMgdl)) return "HIPOGLICEMIA";
  if (isHyperglycemia(valueMgdl, context)) return "HIPERGLICEMIA";
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

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export type WeeklyGlucosePoint = { day: string; value: number | null };

/** Semana corrente (segunda a domingo), média diária dos registros. */
export function buildWeeklyGlucoseSeries(
  records: { valueMgdl: number; measuredAt: Date }[],
  referenceDate: Date = new Date()
): WeeklyGlucosePoint[] {
  const startOfWeek = new Date(referenceDate);
  const isoWeekday = (startOfWeek.getDay() + 6) % 7; // 0 = segunda
  startOfWeek.setDate(startOfWeek.getDate() - isoWeekday);
  startOfWeek.setHours(0, 0, 0, 0);

  const buckets: number[][] = Array.from({ length: 7 }, () => []);

  for (const record of records) {
    const diffDays = Math.floor(
      (record.measuredAt.getTime() - startOfWeek.getTime()) / 86_400_000
    );
    if (diffDays >= 0 && diffDays < 7) {
      buckets[diffDays].push(record.valueMgdl);
    }
  }

  return buckets.map((values, index) => ({
    day: WEEKDAY_LABELS[index],
    value: values.length
      ? Math.round(
          values.reduce((sum, value) => sum + value, 0) / values.length
        )
      : null,
  }));
}
