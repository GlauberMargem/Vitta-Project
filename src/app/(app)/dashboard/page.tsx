import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { NovaGlicoseDialog } from "@/components/patient/NovaGlicoseDialog";
import { NovaRefeicaoDialog } from "@/components/patient/NovaRefeicaoDialog";
import { contextLabel, formatDateTime } from "@/lib/patient/format";

type HistoryItem = {
  kind: "glucose" | "meal";
  id: string;
  date: Date;
  label: string;
  detail: string;
};

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

  const [glucoseRecords, meals, mealNameRows] = await Promise.all([
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
  ]);

  const history: HistoryItem[] = [
    ...glucoseRecords.map((record) => ({
      kind: "glucose" as const,
      id: record.id,
      date: record.measuredAt,
      label: `${record.valueMgdl} mg/dL`,
      detail: contextLabel(record.context),
    })),
    ...meals.map((meal) => ({
      kind: "meal" as const,
      id: meal.id,
      date: meal.eatenAt,
      label: meal.name ?? "Refeição",
      detail: `${meal.carbsG} g de carboidratos`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  const mealNameSuggestions = mealNameRows
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-28 pt-6">
      <div>
        <p className="text-sm text-muted-foreground">Bom dia!</p>
        <h1 className="text-xl font-semibold text-foreground">
          {session.user.name}
        </h1>
      </div>

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
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-muted-foreground">{item.detail}</p>
                </div>
                <time
                  className="shrink-0 text-xs text-muted-foreground"
                  dateTime={item.date.toISOString()}
                >
                  {formatDateTime(item.date)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
