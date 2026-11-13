"use client";

import { Column, Row, Tag, Text } from "@once-ui-system/core";
import { LineChart } from "@once-ui-system/core/data";
import { type WeightPoint, fmtDate, fmtMonthYear } from "@/lib/data";

export function WeightTrend({ points }: { points: WeightPoint[] }) {
  const first = points[0];
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;
  const sinceLast = last.kg - prev.kg;
  const data = points.map((p) => ({ date: fmtMonthYear(p.date), kg: p.kg }));
  const summary = `Weight in kilograms at ${points.length} visits: ${points
    .map((p) => `${p.kg} on ${fmtDate(p.date)}`)
    .join(", ")}.`;

  return (
    <Column gap="16" fillWidth>
      <Row gap="16" vertical="center" wrap>
        <Text textVariant="display-strong-xs">{last.kg.toFixed(1)} kg</Text>
        <Column gap="4">
          <Tag
            tone="neutral"
            prefixIcon="trendDown"
            label={`${change.toFixed(1)} kg (${pct.toFixed(1)}%) since ${fmtDate(first.date)}`}
          />
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            {sinceLast.toFixed(1)} kg since the visit on {fmtDate(prev.date)}
          </Text>
        </Column>
      </Row>
      <Column fillWidth height={20}>
        <LineChart
          aria-label={`Weight in kilograms over the last ${points.length} visits`}
          summary={summary}
          fillWidth
          height={20}
          curve="monotone"
          series={[{ key: "kg", label: "Weight (kg)" }]}
          data={data}
          legend={{ display: false }}
        />
      </Column>
    </Column>
  );
}
