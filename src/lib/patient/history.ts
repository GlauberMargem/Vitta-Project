import type { GlucoseContext } from "@/generated/prisma/client";
import { contextLabel } from "./format";
import {
  getPeriodRange,
  glucoseAlert,
  type GlucoseAlert,
  type ReportPeriod,
} from "./glucose";

export type HistoryItem = {
  kind: "glucose" | "meal";
  id: string;
  date: Date;
  label: string;
  detail: string;
  alert: GlucoseAlert;
};

type GlucoseRecordLike = {
  id: string;
  measuredAt: Date;
  valueMgdl: number;
  context: GlucoseContext;
};

type MealLike = {
  id: string;
  eatenAt: Date;
  name: string | null;
  carbsG: number;
};

/** Mescla glicose + refeição por data, mais recente primeiro. Usado na home do
 * paciente e no histórico somente leitura do médico. */
export function buildHistory(
  glucoseRecords: GlucoseRecordLike[],
  meals: MealLike[],
  limit = 10
): HistoryItem[] {
  return [
    ...glucoseRecords.map((record) => ({
      kind: "glucose" as const,
      id: record.id,
      date: record.measuredAt,
      label: `${record.valueMgdl} mg/dL`,
      detail: contextLabel(record.context),
      alert: glucoseAlert(record.valueMgdl, record.context),
    })),
    ...meals.map((meal) => ({
      kind: "meal" as const,
      id: meal.id,
      date: meal.eatenAt,
      label: meal.name ?? "Refeição",
      detail: `${meal.carbsG} g de carboidratos`,
      alert: null,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

const REPORT_PERIODS: ReportPeriod[] = ["daily", "weekly", "monthly"];

/** Histórico completo (sem limite) de cada período — usado no relatório em PDF
 * (RF08). `glucoseRecords`/`meals` devem cobrir pelo menos os últimos 30 dias
 * (a maior janela), já que "diária"/"semanal" são recortes dela. */
export function buildReportHistories(
  glucoseRecords: GlucoseRecordLike[],
  meals: MealLike[],
  referenceDate: Date = new Date()
): Record<ReportPeriod, HistoryItem[]> {
  const result = {} as Record<ReportPeriod, HistoryItem[]>;
  for (const period of REPORT_PERIODS) {
    const { start, end } = getPeriodRange(period, referenceDate);
    const records = glucoseRecords.filter(
      (record) => record.measuredAt >= start && record.measuredAt < end
    );
    const periodMeals = meals.filter(
      (meal) => meal.eatenAt >= start && meal.eatenAt < end
    );
    result[period] = buildHistory(records, periodMeals, Infinity);
  }
  return result;
}
