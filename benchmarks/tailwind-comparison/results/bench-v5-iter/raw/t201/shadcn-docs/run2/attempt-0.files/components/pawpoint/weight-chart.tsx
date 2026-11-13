"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { WeightPoint } from "@/lib/data";
import { formatDate, formatShortDate } from "@/lib/schedule";

const config = {
  kg: { label: "Weight (kg)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function WeightChart({ points }: { points: WeightPoint[] }) {
  const data = points.map((p) => ({ ...p, label: formatShortDate(p.date) }));
  const values = points.map((p) => p.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-56 w-full sm:h-64" role="img" aria-label={`Weight in kilograms over ${points.length} visits, from ${points[0]?.kg} to ${points[points.length - 1]?.kg}`}>
        <LineChart data={data} margin={{ top: 22, right: 20, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} padding={{ left: 16, right: 8 }} />
          <YAxis domain={[min, max]} width={34} tickLine={false} axisLine={false} tickCount={max - min + 1} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const date = (payload?.[0]?.payload as { date?: string } | undefined)?.date;
                  return date ? formatDate(date) : "";
                }}
              />
            }
          />
          <Line
            dataKey="kg"
            type="monotone"
            stroke="var(--color-kg)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--color-kg)", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          >
            <LabelList dataKey="kg" position="top" offset={10} className="fill-foreground text-[11px] font-medium" />
          </Line>
        </LineChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Weight history</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{formatDate(p.date)}</td>
              <td>{p.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
