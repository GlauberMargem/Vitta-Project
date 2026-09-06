"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlicemiaChart } from "@/components/patient/GlicemiaChart";
import type { GlucosePoint } from "@/lib/patient/glucose";
import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "monthly";

const PERIOD_OPTIONS: { value: Period; label: string; title: string }[] = [
  { value: "daily", label: "Dia", title: "Glicemia ao longo do dia" },
  { value: "weekly", label: "Semana", title: "Glicemia ao longo da semana" },
  { value: "monthly", label: "Mês", title: "Glicemia nos últimos 30 dias" },
];

export function GlicemiaChartCard({
  daily,
  weekly,
  monthly,
}: {
  daily: GlucosePoint[];
  weekly: GlucosePoint[];
  monthly: GlucosePoint[];
}) {
  const [period, setPeriod] = useState<Period>("weekly");
  const current = PERIOD_OPTIONS.find((option) => option.value === period)!;
  const data = period === "daily" ? daily : period === "weekly" ? weekly : monthly;

  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-base font-semibold text-foreground">
          {current.title}
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
      {period === "daily" && data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum registro de glicose hoje.
        </p>
      ) : (
        <GlicemiaChart data={data} />
      )}
    </section>
  );
}
