"use client";

import { LineChart } from "@mantine/charts";
import { VisuallyHidden } from "@mantine/core";
import { fmtDate } from "@/lib/utils";

type Props = { weights: { date: string; kg: number }[]; name: string };

const label = (iso: string) => {
  const month = fmtDate(iso, { day: undefined, year: undefined, month: "short" });
  return `${month} ’${iso.slice(2, 4)}`;
};

export function WeightChart({ weights, name }: Props) {
  const data = weights.map((w) => ({ date: label(w.date), Weight: w.kg }));
  const values = weights.map((w) => w.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  return (
    <>
      <LineChart
        h={260}
        data={data}
        dataKey="date"
        series={[{ name: "Weight", color: "teal.7" }]}
        curveType="linear"
        yAxisProps={{ domain: [min, max], width: 44 }}
        valueFormatter={(v) => `${v} kg`}
        withDots
        dotProps={{ r: 5 }}
        activeDotProps={{ r: 7 }}
        gridAxis="xy"
        aria-hidden
      />
      <VisuallyHidden>
        <ul aria-label={`${name}'s weight by visit`}>
          {weights.map((w) => (
            <li key={w.date}>
              {fmtDate(w.date)}: {w.kg} kg
            </li>
          ))}
        </ul>
      </VisuallyHidden>
    </>
  );
}
