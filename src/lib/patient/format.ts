import type { GlucoseContext } from "@/generated/prisma/client";

export function contextLabel(context: GlucoseContext): string {
  switch (context) {
    case "JEJUM":
      return "Jejum";
    case "POS_PRANDIAL":
      return "Depois de comer";
    case "ANTES_DE_DORMIR":
      return "Antes de dormir";
    default:
      return "Outro";
  }
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}
