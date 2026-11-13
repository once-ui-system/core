"use client";

import Box from "@mui/material/Box";
import { LineChart } from "@mui/x-charts/LineChart";
import { fmtDate, fmtMonthYear, type WeightPoint } from "@/lib/data";

export function WeightChart({ points, name }: { points: WeightPoint[]; name: string }) {
  const kgs = points.map((p) => p.kg);
  const min = Math.floor(Math.min(...kgs) - 1);
  const max = Math.ceil(Math.max(...kgs) + 1);
  return (
    <Box>
      <LineChart
        height={260}
        hideLegend
        grid={{ horizontal: true }}
        xAxis={[
          {
            scaleType: "point",
            data: points.map((p) => p.date),
            valueFormatter: (v: string, ctx: { location: string }) => (ctx.location === "tooltip" ? fmtDate(v) : fmtMonthYear(v)),
          },
        ]}
        yAxis={[{ min, max, width: 44, valueFormatter: (v: number) => `${v}` }]}
        series={[
          {
            data: kgs,
            label: `${name} weight`,
            color: "var(--mui-palette-primary-main)",
            showMark: true,
            valueFormatter: (v: number | null) => (v === null ? "" : `${v.toFixed(1)} kg`),
          },
        ]}
        margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
      />
    </Box>
  );
}
