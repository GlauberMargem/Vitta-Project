import { HBA1C_TARGET_PERCENT } from "@/lib/patient/glucose";

/** `patientName` presente = visão do médico sobre um paciente (texto neutro,
 * sem a mensagem motivacional que só faz sentido endereçada ao paciente). */
export function HbA1cCard({
  hba1c,
  patientName,
}: {
  hba1c: number | null;
  patientName?: string;
}) {
  if (hba1c === null) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      {patientName ? (
        <p className="text-sm text-muted-foreground">
          Hemoglobina glicada estimada de {patientName}:{" "}
          <span className="font-semibold text-foreground">
            {hba1c.toFixed(1)}%
          </span>{" "}
          (meta de referência: até {HBA1C_TARGET_PERCENT}%)
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Sua hemoglobina glicada está em{" "}
            <span className="font-semibold text-foreground">
              {hba1c.toFixed(1)}%
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Não desanime, nossa meta é de até {HBA1C_TARGET_PERCENT}%.
            Estimativa calculada a partir dos seus registros dos últimos 90
            dias, não substitui o exame laboratorial.
          </p>
        </>
      )}
    </section>
  );
}
