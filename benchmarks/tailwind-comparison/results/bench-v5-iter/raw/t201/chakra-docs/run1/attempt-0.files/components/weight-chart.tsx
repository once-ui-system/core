"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Box, VisuallyHidden } from "@chakra-ui/react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { fmtDate, fmtShortDate } from "@/lib/data";

export function WeightChart({ weights }: { weights: { date: string; kg: number }[] }) {
  const chart = useChart({
    data: weights.map((w) => ({ label: fmtShortDate(w.date), kg: w.kg })),
    series: [{ name: "kg", color: "teal.solid" }],
  });

  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) - 1);
  const max = Math.ceil(Math.max(...weights.map((w) => w.kg)) + 1);

  return (
    <Box>
      <VisuallyHidden>
        Weight readings:{" "}
        {weights.map((w) => `${fmtDate(w.date)}, ${w.kg} kilograms`).join("; ")}.
      </VisuallyHidden>
      <Chart.Root chart={chart} h="220px" w="full" aria-hidden>
        <LineChart data={chart.data} responsive margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid stroke={chart.color("border")} vertical={false} />
          <XAxis axisLine={false} dataKey={chart.key("label")} stroke={chart.color("border")} tick={{ fill: chart.color("fg.muted"), fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={40}
            domain={[min, max]}
            tickFormatter={(v: number) => `${v}`}
            stroke={chart.color("border")}
            tick={{ fill: chart.color("fg.muted"), fontSize: 12 }}
          />
          <Tooltip
            animationDuration={100}
            cursor={false}
            content={<Chart.Tooltip />}
          />
          {chart.series.map((item) => (
            <Line
              key={item.name}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              stroke={chart.color(item.color)}
              strokeWidth={3}
              dot={{ r: 4, fill: chart.color(item.color) }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </Chart.Root>
    </Box>
  );
}
