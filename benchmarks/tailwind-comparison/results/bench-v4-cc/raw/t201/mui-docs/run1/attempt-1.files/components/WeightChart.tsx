"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { fmtDate, shortMonth } from "@/lib/data";

export default function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const summary = `Weight in kilograms: ${points.map((p) => `${fmtDate(p.date)}, ${p.kg}`).join("; ")}.`;
  return (
    <div role="img" aria-label={summary}>
      <LineChart
        height={260}
        hideLegend
        xAxis={[{ scaleType: "point", data: points.map((p) => shortMonth(p.date)) }]}
        yAxis={[{ min: 27, max: 33 }]}
        series={[
          {
            data: points.map((p) => p.kg),
            label: "Weight",
            showMark: true,
            valueFormatter: (v) => (v == null ? "" : `${v.toFixed(1)} kg`),
          },
        ]}
        margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
      />
    </div>
  );
}
