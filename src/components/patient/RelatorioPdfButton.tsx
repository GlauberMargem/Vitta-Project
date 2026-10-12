"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glucoseAlertLabel, type ReportPeriod } from "@/lib/patient/glucose";
import { groupHistoryByDay, type HistoryItem } from "@/lib/patient/history";
import { formatDayLabel, formatTime } from "@/lib/patient/format";

const PRIMARY_RGB: [number, number, number] = [105, 147, 197];
const PRIMARY_TINT_RGB: [number, number, number] = [224, 234, 245];
const ALERT_TINT_RGB: [number, number, number] = [255, 231, 225];
const FOREGROUND_RGB: [number, number, number] = [45, 45, 45];
const MUTED_RGB: [number, number, number] = [120, 120, 120];

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
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 14;
      const periodLabel = PERIOD_OPTIONS.find(
        (option) => option.value === period
      )!.label;

      doc.setFillColor(...PRIMARY_RGB);
      doc.rect(0, 0, pageWidth, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Vitta", marginX, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Relatório glicêmico", marginX, 21);

      const rightColX = pageWidth / 2 + 10;
      let infoY = 38;
      doc.setTextColor(...FOREGROUND_RGB);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Paciente", marginX, infoY);
      doc.text("Período", rightColX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(patientName, marginX, infoY + 5);
      doc.text(periodLabel, rightColX, infoY + 5);

      infoY += 14;
      doc.setFont("helvetica", "bold");
      doc.text("Gerado em", marginX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleString("pt-BR"), marginX, infoY + 5);

      if (hba1c !== null) {
        doc.setFont("helvetica", "bold");
        doc.text("HbA1c estimada (90 dias)", rightColX, infoY);
        doc.setFont("helvetica", "normal");
        doc.text(`${hba1c.toFixed(1)}%`, rightColX, infoY + 5);
      }

      doc.setDrawColor(230, 230, 230);
      doc.line(marginX, infoY + 11, pageWidth - marginX, infoY + 11);

      let cursorY = infoY + 20;
      const dayGroups = groupHistoryByDay(histories[period]);

      if (dayGroups.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(...MUTED_RGB);
        doc.text("Nenhum registro no período.", marginX, cursorY);
      }

      for (const group of dayGroups) {
        if (cursorY + 30 > pageHeight - 16) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFillColor(...PRIMARY_TINT_RGB);
        doc.rect(marginX, cursorY, pageWidth - marginX * 2, 8, "F");
        doc.setTextColor(...FOREGROUND_RGB);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(formatDayLabel(group.date), marginX + 2, cursorY + 5.5);

        const rows = group.items.map((item) => [
          formatTime(item.date),
          item.kind === "glucose" ? "Glicose" : "Refeição",
          `${item.label}, ${item.detail}`,
          item.alert ? glucoseAlertLabel(item.alert) : "",
        ]);

        autoTable(doc, {
          startY: cursorY + 10,
          margin: { left: marginX, right: marginX, top: 16 },
          head: [["Hora", "Tipo", "Detalhe", "Alerta"]],
          body: rows,
          styles: { fontSize: 9 },
          headStyles: { fillColor: PRIMARY_RGB, textColor: 255 },
          didParseCell: (data) => {
            if (data.section === "body" && data.row.cells[3]?.raw) {
              data.cell.styles.fillColor = ALERT_TINT_RGB;
            }
          },
        });

        cursorY =
          (doc as unknown as { lastAutoTable: { finalY: number } })
            .lastAutoTable.finalY + 10;
      }

      doc.save(`relatorio-vitta-${period}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
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
                "h-7 rounded-lg px-3 text-xs",
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
        className="w-full rounded-lg"
      >
        {isGenerating ? "Gerando..." : "Baixar relatório"}
      </Button>
    </section>
  );
}
