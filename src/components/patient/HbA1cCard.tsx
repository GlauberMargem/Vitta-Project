import { HBA1C_TARGET_PERCENT, hba1cColor } from "@/lib/patient/glucose";

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
    <section className="rounded-lg bg-card p-5 shadow-sm">
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
          <p className="text-xl font-bold text-foreground">
            Sua <span className="text-[#2E7D32]">hemoglobina glicada</span>{" "}
            está em
          </p>
          <p
            className="text-4xl font-extrabold"
            style={{ color: hba1cColor(hba1c) }}
          >
            {hba1c.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hba1c <= HBA1C_TARGET_PERCENT
              ? "Muito bem, você está dentro da meta de até"
              : "Não desanime, nossa meta é de até"}{" "}
            <span className="font-semibold text-[#2E7D32]">
              {HBA1C_TARGET_PERCENT}%
            </span>
            . Estimativa calculada a partir dos seus registros dos últimos 90
            dias, não substitui o exame laboratorial.
          </p>
        </>
      )}
    </section>
  );
}
