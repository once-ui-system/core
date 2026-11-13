"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import { formatDate } from "@/lib/data";

export default function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.kg - first.kg;
  const pct = (delta / first.kg) * 100;
  const labels = points.map((p) => formatDate(p.date, false));
  const lo = Math.floor(Math.min(...points.map((p) => p.kg)) - 1);
  const hi = Math.ceil(Math.max(...points.map((p) => p.kg)) + 1);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>{last.kg.toFixed(1)} kg</Typography>
        <Typography sx={{ color: "warning.main", fontWeight: 700 }}>
          {delta.toFixed(1)} kg ({pct.toFixed(0)}%) since {formatDate(first.date)}
        </Typography>
      </Box>
      <Box role="img" aria-label={`Weight over ${points.length} visits: ${points.map((p) => `${formatDate(p.date)} ${p.kg} kg`).join(", ")}.`} sx={{ mt: 1 }}>
        <LineChart
          height={240}
          xAxis={[{ scaleType: "point", data: labels }]}
          yAxis={[{ min: lo, max: hi, width: 44, valueFormatter: (v: number | null) => (v == null ? "" : `${v}`) }]}
          series={[{ data: points.map((p) => p.kg), label: "Weight (kg)", color: "var(--mui-palette-primary-main)", valueFormatter: (v) => (v == null ? "" : `${v.toFixed(1)} kg`) }]}
          grid={{ horizontal: true }}
          hideLegend
          margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
        />
      </Box>
    </Box>
  );
}
