"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { GlucosePoint } from "@/lib/patient/glucose";

const chartConfig = {
  value: {
    label: "Glicemia (mg/dL)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function GlicemiaChart({ data }: { data: GlucosePoint[] }) {
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
          domain={[50, 500]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={32}
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
