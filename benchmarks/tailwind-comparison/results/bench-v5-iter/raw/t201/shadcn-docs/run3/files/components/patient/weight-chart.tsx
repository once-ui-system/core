"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatDate } from "@/lib/data";

const config = {
  kg: { label: "Weight (kg)", color: "var(--chart-2)" },
} satisfies ChartConfig;

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", year: "2-digit" }).format(
    new Date(`${iso}T12:00:00Z`),
  );

export function WeightChart({ weights }: { weights: { date: string; kg: number }[] }) {
  const data = weights.map((w) => ({ ...w, label: monthYear(w.date), full: formatDate(w.date) }));
  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) - 1);
  const max = Math.ceil(Math.max(...weights.map((w) => w.kg)) + 1);
  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-60 w-full sm:h-64">
        <LineChart accessibilityLayer data={data} margin={{ top: 22, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
          <YAxis domain={[min, max]} tickLine={false} axisLine={false} width={34} tickCount={5} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""} />}
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
            <LabelList dataKey="kg" position="top" offset={10} className="fill-foreground text-xs font-medium" />
          </Line>
        </LineChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Weight in kilograms at each visit</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.full}</td>
              <td>{d.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
