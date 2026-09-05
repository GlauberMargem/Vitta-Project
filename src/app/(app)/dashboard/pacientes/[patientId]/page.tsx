import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { GlicemiaChartCard } from "@/components/patient/GlicemiaChartCard";
import { HbA1cCard } from "@/components/patient/HbA1cCard";
import { HistoricoList } from "@/components/patient/HistoricoList";
import { RelatorioPdfButton } from "@/components/patient/RelatorioPdfButton";
import { NovaAnotacaoForm } from "@/components/doctor/NovaAnotacaoForm";
import { buildHistory, buildReportHistories } from "@/lib/patient/history";
import { formatDateTime } from "@/lib/patient/format";
import {
  buildDailyGlucoseSeries,
  buildMonthlyGlucoseSeries,
  buildWeeklyGlucoseSeries,
  estimateHbA1c,
  toGlucoseThresholds,
} from "@/lib/patient/glucose";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") {
    return null;
  }

  const { patientId } = await params;
  const doctorId = session.user.id;

  // Regra de acesso (specs/04-modelo-de-dados.md): médico só lê dados de
  // paciente com vínculo `ACTIVE` — nunca por patientId direto.
  const link = await db.patientDoctorLink.findFirst({
    where: { doctorId, patientId, status: "ACTIVE" },
    include: { patient: { include: { user: { select: { name: true } } } } },
  });

  if (!link || !link.patient) {
    notFound();
  }

  const patientName = link.patient.user.name;
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const [
    glucoseRecords,
    meals,
    glucoseRecords90d,
    glucoseRecords30d,
    meals30d,
    clinicalNotes,
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
    db.clinicalNote.findMany({
      where: { linkId: link.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const thresholds = toGlucoseThresholds(link.patient);
  const history = buildHistory(glucoseRecords, meals, thresholds);
  const reportHistories = buildReportHistories(
    glucoseRecords30d,
    meals30d,
    thresholds
  );
  const dailySeries = buildDailyGlucoseSeries(glucoseRecords90d);
  const weeklySeries = buildWeeklyGlucoseSeries(glucoseRecords90d);
  const monthlySeries = buildMonthlyGlucoseSeries(glucoseRecords90d);
  const hba1c = estimateHbA1c(glucoseRecords90d);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-28 pt-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Pacientes vinculados
        </Link>
        <h1 className="text-xl font-semibold text-foreground">
          {patientName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Histórico somente leitura — você não pode criar ou alterar
          registros deste paciente.
        </p>
      </div>

      <HbA1cCard hba1c={hba1c} patientName={patientName} />

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
        patientName={patientName}
        hba1c={hba1c}
        histories={reportHistories}
      />

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Anotações clínicas
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Visíveis só para você — o paciente não tem acesso a essas notas.
        </p>
        <NovaAnotacaoForm linkId={link.id} />
        {clinicalNotes.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            {clinicalNotes.map((clinicalNote) => (
              <li key={clinicalNote.id} className="text-sm">
                <p className="whitespace-pre-wrap text-foreground">
                  {clinicalNote.note}
                </p>
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={clinicalNote.createdAt.toISOString()}
                >
                  {formatDateTime(clinicalNote.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
