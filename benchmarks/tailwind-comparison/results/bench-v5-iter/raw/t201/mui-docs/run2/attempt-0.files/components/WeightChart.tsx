"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { formatDate } from "@/lib/data";
import type { Weight } from "@/lib/data";

export default function WeightChart({ weights }: { weights: Weight[] }) {
  const dates = weights.map((w) => new Date(`${w.date}T00:00:00Z`));
  const values = weights.map((w) => w.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  return (
    <LineChart
      height={280}
      hideLegend
      grid={{ horizontal: true }}
      margin={{ left: 4, right: 16, top: 16, bottom: 8 }}
      xAxis={[
        {
          scaleType: "time",
          data: dates,
          tickMinStep: 1000 * 60 * 60 * 24 * 60,
          valueFormatter: (d: Date) => formatDate(d.toISOString().slice(0, 10)),
        },
      ]}
      yAxis={[{ min, max, width: 48, valueFormatter: (v: number | null) => (v == null ? "" : `${v} kg`) }]}
      series={[
        {
          data: values,
          label: "Weight",
          color: "var(--mui-palette-primary-main)",
          showMark: true,
          valueFormatter: (v: number | null) => (v == null ? "" : `${v.toFixed(1)} kg`),
        },
      ]}
      aria-label="Line chart of Olive's weight in kilograms at each visit, falling from 31.8 kg in May 2025 to 28.6 kg today"
    />
  );
}
