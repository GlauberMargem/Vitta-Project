import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { NovaGlicoseDialog } from "@/components/patient/NovaGlicoseDialog";
import { NovaRefeicaoDialog } from "@/components/patient/NovaRefeicaoDialog";
import { GlicemiaChart } from "@/components/patient/GlicemiaChart";
import { contextLabel, formatDateTime } from "@/lib/patient/format";
import {
  buildWeeklyGlucoseSeries,
  estimateHbA1c,
  glucoseAlert,
  glucoseAlertLabel,
  HBA1C_TARGET_PERCENT,
  type GlucoseAlert,
} from "@/lib/patient/glucose";
import { cn } from "@/lib/utils";

type HistoryItem = {
  kind: "glucose" | "meal";
  id: string;
  date: Date;
  label: string;
  detail: string;
  alert: GlucoseAlert;
};

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    return null;
  }

  if (session.user.role !== "PATIENT") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-28 pt-6">
        <p className="text-sm text-muted-foreground">
          Painel do médico ainda não implementado (ver specs/07-roadmap.md,
          bloco 6).
        </p>
      </main>
    );
  }

  const patientId = session.user.id;
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);

  const [glucoseRecords, meals, mealNameRows, glucoseRecords90d] =
    await Promise.all([
      db.glucoseRecord.findMany({
        where: { patientId },
        orderBy: { measuredAt: "desc" },
        take: 10,
      }),
      db.meal.findMany({
        where: { patientId },
        orderBy: { eatenAt: "desc" },
        take: 10,
      }),
      db.meal.findMany({
        where: { patientId, name: { not: null } },
        distinct: ["name"],
        select: { name: true },
        take: 20,
      }),
      db.glucoseRecord.findMany({
        where: { patientId, measuredAt: { gte: ninetyDaysAgo } },
        select: { valueMgdl: true, measuredAt: true },
        orderBy: { measuredAt: "asc" },
      }),
    ]);

  const history: HistoryItem[] = [
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
    .slice(0, 10);

  const mealNameSuggestions = mealNameRows
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));

  const weeklySeries = buildWeeklyGlucoseSeries(glucoseRecords90d);
  const hba1c = estimateHbA1c(glucoseRecords90d);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-28 pt-6">
      <div>
        <p className="text-sm text-muted-foreground">Bom dia!</p>
        <h1 className="text-xl font-semibold text-foreground">
          {session.user.name}
        </h1>
      </div>

      {hba1c !== null ? (
        <section className="rounded-3xl bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Sua hemoglobina glicada estimada está em{" "}
            <span className="font-semibold text-foreground">
              {hba1c.toFixed(1)}%
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Não desanime, nossa meta é de até {HBA1C_TARGET_PERCENT}%.
            Estimativa calculada a partir dos seus registros dos últimos 90
            dias, não substitui o exame laboratorial.
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Ações
        </h2>
        <div className="flex gap-3">
          <NovaGlicoseDialog />
          <NovaRefeicaoDialog mealNameSuggestions={mealNameSuggestions} />
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Glicemia ao longo da semana
        </h2>
        <GlicemiaChart data={weeklySeries} />
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Histórico recente
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum registro ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {history.map((item) => (
              <li
                key={`${item.kind}-${item.id}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm",
                  item.alert ? "bg-alert/20" : undefined
                )}
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-muted-foreground">{item.detail}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={item.date.toISOString()}
                  >
                    {formatDateTime(item.date)}
                  </time>
                  {item.alert ? (
                    <span className="text-xs font-medium text-alert-foreground">
                      {glucoseAlertLabel(item.alert)}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
