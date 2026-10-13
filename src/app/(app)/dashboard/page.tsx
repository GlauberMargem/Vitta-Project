import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { AppMain } from "@/components/AppMain";
import { GreetingHeader } from "@/components/GreetingHeader";
import { AcoesRapidas } from "@/components/patient/AcoesRapidas";
import { GlicemiaChartCard } from "@/components/patient/GlicemiaChartCard";
import { HbA1cCard } from "@/components/patient/HbA1cCard";
import { HistoricoList } from "@/components/patient/HistoricoList";
import { GerarConviteCard } from "@/components/doctor/GerarConviteCard";
import { PendingInviteCodes } from "@/components/doctor/PendingInviteCodes";
import { buildHistory } from "@/lib/patient/history";
import {
  buildDailyGlucoseSeries,
  buildMonthlyGlucoseSeries,
  buildQuarterlyGlucoseSeries,
  buildWeeklyGlucoseSeries,
  DEFAULT_GLUCOSE_THRESHOLDS,
  estimateHbA1c,
  glucoseAlert,
  glucoseAlertLabel,
  hba1cColor,
  mostSevereAlert,
  toGlucoseThresholds,
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
      <AppMain className="gap-4">
        <p className="text-sm text-muted-foreground">
          Perfil não reconhecido.
        </p>
      </AppMain>
    );
  }

  const patientId = session.user.id;
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const [glucoseRecords, meals, mealNameRows, glucoseRecords90d, thresholdsRow] =
    await Promise.all([
      db.glucoseRecord.findMany({
        where: { patientId },
        orderBy: { measuredAt: "desc" },
        take: 10,
        include: { linkedMeal: { select: { name: true } } },
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
  const history = buildHistory(glucoseRecords, meals, thresholds);

  const mealNameSuggestions = mealNameRows
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));

  const dailySeries = buildDailyGlucoseSeries(glucoseRecords90d);
  const weeklySeries = buildWeeklyGlucoseSeries(glucoseRecords90d);
  const monthlySeries = buildMonthlyGlucoseSeries(glucoseRecords90d);
  const quarterlySeries = buildQuarterlyGlucoseSeries(glucoseRecords90d);
  const hba1c = estimateHbA1c(glucoseRecords90d);

  return (
    <AppMain>
      <GreetingHeader name={session.user.name ?? "Paciente"} />

      <HbA1cCard hba1c={hba1c} />

      <section className="rounded-lg bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Ações
        </h2>
        <AcoesRapidas
          recentMeals={meals}
          recentGlucoseRecords={glucoseRecords}
          mealNameSuggestions={mealNameSuggestions}
        />
      </section>

      <GlicemiaChartCard
        daily={dailySeries}
        weekly={weeklySeries}
        monthly={monthlySeries}
        quarterly={quarterlySeries}
      />

      <section className="rounded-lg bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Histórico recente
        </h2>
        <HistoricoList history={history} />
      </section>
    </AppMain>
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
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);
  const [glucoseRecords90d, thresholdRows] = await Promise.all([
    patientIds.length
      ? db.glucoseRecord.findMany({
          where: {
            patientId: { in: patientIds },
            measuredAt: { gte: ninetyDaysAgo },
          },
          select: {
            patientId: true,
            valueMgdl: true,
            context: true,
            measuredAt: true,
          },
        })
      : Promise.resolve([]),
    patientIds.length
      ? db.patientProfile.findMany({
          where: { userId: { in: patientIds } },
          select: {
            userId: true,
            hypoThreshold: true,
            severeHypoThreshold: true,
            hyperFastingThreshold: true,
            hyperPostprandialThreshold: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const thresholdsByPatient = new Map(
    thresholdRows.map((row) => [row.userId, toGlucoseThresholds(row)])
  );

  const alertsByPatient = new Map<string, ReturnType<typeof glucoseAlert>[]>();
  const hba1cRecordsByPatient = new Map<string, { valueMgdl: number }[]>();
  for (const record of glucoseRecords90d) {
    const hba1cRecords = hba1cRecordsByPatient.get(record.patientId) ?? [];
    hba1cRecords.push(record);
    hba1cRecordsByPatient.set(record.patientId, hba1cRecords);

    if (record.measuredAt < riskWindowStart) continue;
    const thresholds =
      thresholdsByPatient.get(record.patientId) ?? DEFAULT_GLUCOSE_THRESHOLDS;
    const alert = glucoseAlert(record.valueMgdl, record.context, thresholds);
    if (!alert) continue;
    const list = alertsByPatient.get(record.patientId) ?? [];
    list.push(alert);
    alertsByPatient.set(record.patientId, list);
  }

  const hba1cByPatient = new Map(
    [...hba1cRecordsByPatient.entries()].map(([patientId, records]) => [
      patientId,
      estimateHbA1c(records),
    ])
  );

  const sortedLinks = [...activeLinks].sort((a, b) => {
    const hba1cA = a.patientId ? (hba1cByPatient.get(a.patientId) ?? null) : null;
    const hba1cB = b.patientId ? (hba1cByPatient.get(b.patientId) ?? null) : null;
    if (hba1cA === null && hba1cB === null) return 0;
    if (hba1cA === null) return 1;
    if (hba1cB === null) return -1;
    return hba1cB - hba1cA;
  });

  return (
    <AppMain>
      <GreetingHeader name={name} />

      <GerarConviteCard />

      <PendingInviteCodes
        codes={pendingCodes.map((link) => ({
          id: link.id,
          code: link.inviteCode,
        }))}
      />

      <section className="rounded-lg bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Pacientes vinculados
        </h2>
        {sortedLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum paciente vinculado ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sortedLinks.map((link) => {
              if (!link.patientId) return null;
              const risk = mostSevereAlert(
                alertsByPatient.get(link.patientId) ?? []
              );
              const hba1c = hba1cByPatient.get(link.patientId) ?? null;
              return (
                <li key={link.id}>
                  <Link
                    href={`/dashboard/pacientes/${link.patientId}`}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                      risk ? "bg-alert/20" : undefined
                    )}
                  >
                    <span className="font-medium text-foreground">
                      {link.patient?.user.name ?? "Paciente"}
                    </span>
                    <span className="flex flex-col items-end gap-0.5">
                      {hba1c !== null ? (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: hba1cColor(hba1c) }}
                        >
                          HbA1c {hba1c.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem registros
                        </span>
                      )}
                      {risk ? (
                        <span className="text-xs font-medium text-alert-foreground">
                          {glucoseAlertLabel(risk)} (últimos 7 dias)
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppMain>
  );
}
