"use client";

import { LineChart } from "@mantine/charts";

export function WeightChart({ data, summary }: { data: { label: string; kg: number }[]; summary: string }) {
  const values = data.map((d) => d.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  return (
    <div role="img" aria-label={summary}>
      <LineChart
        h={260}
        data={data}
        dataKey="label"
        series={[{ name: "kg", label: "Weight (kg)", color: "teal.7" }]}
        curveType="linear"
        withDots
        gridAxis="xy"
        yAxisProps={{ domain: [min, max] }}
        valueFormatter={(v) => `${v} kg`}
      />
    </div>
  );
}
