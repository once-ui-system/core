"use client";

import { LineChart } from "@once-ui-system/core/data";

const fmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const data = points.map((p) => ({ label: fmt.format(new Date(`${p.date}T00:00:00Z`)), kg: p.kg }));
  return (
    <LineChart
      fillWidth
      height={18}
      title="Weight (kg)"
      description="At each visit"
      series={[{ key: "kg" }]}
      data={data}
      curve="linear"
    />
  );
}
