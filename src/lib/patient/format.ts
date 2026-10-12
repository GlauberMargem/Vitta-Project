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

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

const dayLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Usado pelo cabeçalho de cada grupo de dia no relatório em PDF (RF08). */
export function formatDayLabel(date: Date): string {
  const label = dayLabelFormatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
