"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatDate, formatMonth } from "@/lib/data";

const config = {
  kg: { label: "Weight (kg)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function WeightChart({
  weights,
}: {
  weights: { date: string; kg: number }[];
}) {
  const data = weights.map((w) => ({ ...w, label: formatMonth(w.date) }));
  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) - 1);
  const max = Math.ceil(Math.max(...weights.map((w) => w.kg)) + 1);

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-60 w-full">
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ top: 24, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            domain={[min, max]}
            tickLine={false}
            axisLine={false}
            width={36}
            tickCount={5}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(_value, payload) => {
                  const d = payload?.[0]?.payload as { date?: string } | undefined;
                  return d?.date ? formatDate(d.date) : "";
                }}
              />
            }
          />
          <Line
            dataKey="kg"
            type="monotone"
            stroke="var(--color-kg)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--color-kg)" }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey="kg"
              position="top"
              offset={10}
              className="fill-foreground text-xs font-medium"
            />
          </Line>
        </LineChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Weight in kilograms at each visit</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {weights.map((w) => (
            <tr key={w.date}>
              <td>{formatDate(w.date)}</td>
              <td>{w.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
