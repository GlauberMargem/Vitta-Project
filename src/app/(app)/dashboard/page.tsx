import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { NovaGlicoseDialog } from "@/components/patient/NovaGlicoseDialog";
import { NovaRefeicaoDialog } from "@/components/patient/NovaRefeicaoDialog";
import { GlicemiaChartCard } from "@/components/patient/GlicemiaChartCard";
import { VinculoMedicoCard } from "@/components/patient/VinculoMedicoCard";
import { HbA1cCard } from "@/components/patient/HbA1cCard";
import { HistoricoList } from "@/components/patient/HistoricoList";
import { RelatorioPdfButton } from "@/components/patient/RelatorioPdfButton";
import { GerarConviteCard } from "@/components/doctor/GerarConviteCard";
import { buildHistory, buildReportHistories } from "@/lib/patient/history";
import {
  buildDailyGlucoseSeries,
  buildMonthlyGlucoseSeries,
  buildWeeklyGlucoseSeries,
  estimateHbA1c,
  glucoseAlert,
  glucoseAlertLabel,
  mostSevereAlert,
} from "@/lib/patient/glucose";
import { cn } from "@/lib/utils";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const RISK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    return null;
  }

  if (session.user.role === "DOCTOR") {
    return (
      <DoctorDashboard
        doctorId={session.user.id}
        name={session.user.name ?? "Médico"}
      />
    );
  }

  if (session.user.role !== "PATIENT") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-28 pt-6">
        <p className="text-sm text-muted-foreground">
          Perfil não reconhecido.
        </p>
      </main>
    );
  }

  const patientId = session.user.id;
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const [
    glucoseRecords,
    meals,
    mealNameRows,
    glucoseRecords90d,
    glucoseRecords30d,
    meals30d,
    activeLinkRow,
  ] = await Promise.all([
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
    db.glucoseRecord.findMany({
      where: { patientId, measuredAt: { gte: thirtyDaysAgo } },
      orderBy: { measuredAt: "desc" },
    }),
    db.meal.findMany({
      where: { patientId, eatenAt: { gte: thirtyDaysAgo } },
      orderBy: { eatenAt: "desc" },
    }),
    db.patientDoctorLink.findFirst({
      where: { patientId, status: "ACTIVE" },
      include: { doctor: { include: { user: { select: { name: true } } } } },
    }),
  ]);

  const history = buildHistory(glucoseRecords, meals);
  const reportHistories = buildReportHistories(glucoseRecords30d, meals30d);

  const mealNameSuggestions = mealNameRows
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));

  const dailySeries = buildDailyGlucoseSeries(glucoseRecords90d);
  const weeklySeries = buildWeeklyGlucoseSeries(glucoseRecords90d);
  const monthlySeries = buildMonthlyGlucoseSeries(glucoseRecords90d);
  const hba1c = estimateHbA1c(glucoseRecords90d);

  const activeLink = activeLinkRow
    ? { id: activeLinkRow.id, doctorName: activeLinkRow.doctor.user.name }
    : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-28 pt-6">
      <div>
        <p className="text-sm text-muted-foreground">Bom dia!</p>
        <h1 className="text-xl font-semibold text-foreground">
          {session.user.name}
        </h1>
      </div>

      <HbA1cCard hba1c={hba1c} />

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Ações
        </h2>
        <div className="flex gap-3">
          <NovaGlicoseDialog />
          <NovaRefeicaoDialog mealNameSuggestions={mealNameSuggestions} />
        </div>
      </section>

      <GlicemiaChartCard
        daily={dailySeries}
        weekly={weeklySeries}
        monthly={monthlySeries}
      />

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Histórico recente
        </h2>
        <HistoricoList history={history} />
      </section>

      <RelatorioPdfButton
        patientName={session.user.name ?? "Paciente"}
        hba1c={hba1c}
        histories={reportHistories}
      />

      <VinculoMedicoCard activeLink={activeLink} />
    </main>
  );
}

async function DoctorDashboard({
  doctorId,
  name,
}: {
  doctorId: string;
  name: string;
}) {
  const [pendingCodes, activeLinks] = await Promise.all([
    db.patientDoctorLink.findMany({
      where: { doctorId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    db.patientDoctorLink.findMany({
      where: { doctorId, status: "ACTIVE" },
      include: { patient: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const patientIds = activeLinks
    .map((link) => link.patientId)
    .filter((id): id is string => Boolean(id));

  const riskWindowStart = new Date(Date.now() - RISK_WINDOW_MS);
  const recentRecords = patientIds.length
    ? await db.glucoseRecord.findMany({
        where: {
          patientId: { in: patientIds },
          measuredAt: { gte: riskWindowStart },
        },
        select: { patientId: true, valueMgdl: true, context: true },
      })
    : [];

  const alertsByPatient = new Map<string, ReturnType<typeof glucoseAlert>[]>();
  for (const record of recentRecords) {
    const alert = glucoseAlert(record.valueMgdl, record.context);
    if (!alert) continue;
    const list = alertsByPatient.get(record.patientId) ?? [];
    list.push(alert);
    alertsByPatient.set(record.patientId, list);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-28 pt-6">
      <div>
        <p className="text-sm text-muted-foreground">Bom dia!</p>
        <h1 className="text-xl font-semibold text-foreground">{name}</h1>
      </div>

      <GerarConviteCard />

      {pendingCodes.length > 0 ? (
        <section className="rounded-3xl bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
            Códigos pendentes
          </h2>
          <ul className="flex flex-col gap-2">
            {pendingCodes.map((link) => (
              <li
                key={link.id}
                className="rounded-2xl bg-muted px-4 py-2 text-center font-mono text-sm tracking-widest text-foreground"
              >
                {link.inviteCode}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Pacientes vinculados
        </h2>
        {activeLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum paciente vinculado ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {activeLinks.map((link) => {
              if (!link.patientId) return null;
              const risk = mostSevereAlert(
                alertsByPatient.get(link.patientId) ?? []
              );
              return (
                <li key={link.id}>
                  <Link
                    href={`/dashboard/pacientes/${link.patientId}`}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm transition-colors hover:bg-muted",
                      risk ? "bg-alert/20" : undefined
                    )}
                  >
                    <span className="font-medium text-foreground">
                      {link.patient?.user.name ?? "Paciente"}
                    </span>
                    {risk ? (
                      <span className="text-xs font-medium text-alert-foreground">
                        {glucoseAlertLabel(risk)} (últimos 7 dias)
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
