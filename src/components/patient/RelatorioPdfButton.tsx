"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glucoseAlertLabel, type ReportPeriod } from "@/lib/patient/glucose";
import type { HistoryItem } from "@/lib/patient/history";
import { formatDateTime } from "@/lib/patient/format";

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: "daily", label: "Dia" },
  { value: "weekly", label: "Semana" },
  { value: "monthly", label: "Mês" },
];

export function RelatorioPdfButton({
  patientName,
  hba1c,
  histories,
}: {
  patientName: string;
  hba1c: number | null;
  histories: Record<ReportPeriod, HistoryItem[]>;
}) {
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const [{ jsPDF }, { autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF();
      const periodLabel = PERIOD_OPTIONS.find(
        (option) => option.value === period
      )!.label;

      doc.setFontSize(16);
      doc.text("Relatório glicêmico — Sistema Vitta", 14, 18);
      doc.setFontSize(10);
      doc.text(`Paciente: ${patientName}`, 14, 26);
      doc.text(`Período: ${periodLabel}`, 14, 32);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 38);
      if (hba1c !== null) {
        doc.text(
          `HbA1c estimada (últimos 90 dias): ${hba1c.toFixed(1)}%`,
          14,
          44
        );
      }

      const rows = histories[period].map((item) => [
        formatDateTime(item.date),
        item.kind === "glucose" ? "Glicose" : "Refeição",
        `${item.label} — ${item.detail}`,
        item.alert ? glucoseAlertLabel(item.alert) : "-",
      ]);

      autoTable(doc, {
        startY: hba1c !== null ? 50 : 44,
        head: [["Data/hora", "Tipo", "Detalhe", "Alerta"]],
        body: rows.length
          ? rows
          : [["-", "-", "Nenhum registro no período", "-"]],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [167, 199, 231] },
      });

      doc.save(`relatorio-vitta-${period}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Relatório em PDF
        </h2>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "h-7 rounded-full px-3 text-xs",
                option.value === period
                  ? "bg-primary text-primary-foreground hover:bg-primary"
                  : undefined
              )}
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <Button
        type="button"
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full rounded-full"
      >
        {isGenerating ? "Gerando..." : "Baixar relatório"}
      </Button>
    </section>
  );
}
