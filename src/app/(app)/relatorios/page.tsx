import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { AppMain } from "@/components/AppMain";
import { RelatorioPdfButton } from "@/components/patient/RelatorioPdfButton";
import { buildReportHistories } from "@/lib/patient/history";
import { estimateHbA1c, toGlucoseThresholds } from "@/lib/patient/glucose";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Rota própria pro relatório em PDF (RF08) — antes vivia dentro do
 * dashboard, virou item de navegação (Navbar) em 2026-10-12, pedido do
 * Glauber. Só paciente — o médico baixa relatório de cada paciente na
 * tela de histórico individual (`dashboard/pacientes/[patientId]/`). */
export default async function RelatoriosPage() {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT") {
    return null;
  }

  const patientId = session.user.id;
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const [glucoseRecords90d, glucoseRecords30d, meals30d, thresholdsRow] =
    await Promise.all([
      db.glucoseRecord.findMany({
        where: { patientId, measuredAt: { gte: ninetyDaysAgo } },
        select: { valueMgdl: true, measuredAt: true },
        orderBy: { measuredAt: "asc" },
      }),
      db.glucoseRecord.findMany({
        where: { patientId, measuredAt: { gte: thirtyDaysAgo } },
        orderBy: { measuredAt: "desc" },
        include: { linkedMeal: { select: { name: true } } },
      }),
      db.meal.findMany({
        where: { patientId, eatenAt: { gte: thirtyDaysAgo } },
        orderBy: { eatenAt: "desc" },
      }),
      db.patientProfile.findUniqueOrThrow({
        where: { userId: patientId },
        select: {
          hypoThreshold: true,
          severeHypoThreshold: true,
          hyperFastingThreshold: true,
          hyperPostprandialThreshold: true,
        },
      }),
    ]);

  const thresholds = toGlucoseThresholds(thresholdsRow);
  const reportHistories = buildReportHistories(
    glucoseRecords30d,
    meals30d,
    thresholds
  );
  const hba1c = estimateHbA1c(glucoseRecords90d);

  return (
    <AppMain>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Baixe um relatório em PDF do seu histórico glicêmico.
        </p>
      </div>

      <RelatorioPdfButton
        patientName={session.user.name ?? "Paciente"}
        hba1c={hba1c}
        histories={reportHistories}
      />
    </AppMain>
  );
}
