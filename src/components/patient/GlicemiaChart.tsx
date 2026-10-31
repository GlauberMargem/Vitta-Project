"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { GlucoseThresholds, GlucosePoint } from "@/lib/patient/glucose";

const chartConfig = {
  value: {
    label: "Glicemia (mg/dL)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const Y_AXIS_MIN = 40;

export function GlicemiaChart({
  data,
  thresholds,
}: {
  data: GlucosePoint[];
  thresholds: GlucoseThresholds;
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          domain={[
            Y_AXIS_MIN,
            (dataMax: number) =>
              Math.max(thresholds.hyperPostprandial + 20, dataMax + 20),
          ]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
        />
        {/* Faixa-alvo de referência (hipo até hiperglicemia pós-prandial) —
            mesmos limites configuráveis do RF05, não um valor fixo. */}
        <ReferenceArea
          y1={thresholds.hypo}
          y2={thresholds.hyperPostprandial}
          fill="#4CAF50"
          fillOpacity={0.08}
          stroke="none"
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
        <Area
          dataKey="value"
          type="monotone"
          fill="var(--color-value)"
          fillOpacity={0.25}
          stroke="var(--color-value)"
          connectNulls={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
