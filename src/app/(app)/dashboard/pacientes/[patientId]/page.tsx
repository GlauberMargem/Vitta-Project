import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { GlicemiaChart } from "@/components/patient/GlicemiaChart";
import { HbA1cCard } from "@/components/patient/HbA1cCard";
import { HistoricoList } from "@/components/patient/HistoricoList";
import { buildHistory } from "@/lib/patient/history";
import { buildWeeklyGlucoseSeries, estimateHbA1c } from "@/lib/patient/glucose";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

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

  const [glucoseRecords, meals, glucoseRecords90d] = await Promise.all([
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
  ]);

  const history = buildHistory(glucoseRecords, meals);
  const weeklySeries = buildWeeklyGlucoseSeries(glucoseRecords90d);
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
        <HistoricoList history={history} />
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Anotações clínicas
        </h2>
        <p className="text-sm text-muted-foreground">
          Ainda não implementado — ver specs/09-sprints.md, Sprint 6.
        </p>
      </section>
    </main>
  );
}
