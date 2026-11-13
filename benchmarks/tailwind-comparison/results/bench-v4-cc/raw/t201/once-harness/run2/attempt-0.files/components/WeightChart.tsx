"use client";

import { Column, Row, Text } from "@once-ui-system/core";
import { dayNumber, fmtDate, fmtShortDate, type Weight } from "@/lib/data";

const W = 600;
const H = 260;
const L = 44;
const R = 28;
const T = 34;
const B = 44;

export function WeightChart({ points }: { points: Weight[] }) {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const kgs = points.map((p) => p.kg);
  let lo = Math.floor(Math.min(...kgs));
  let hi = Math.ceil(Math.max(...kgs));
  if (hi === lo) hi += 1;
  const d0 = dayNumber(first.date);
  const span = Math.max(1, dayNumber(last.date) - d0);
  const x = (iso: string) => L + ((dayNumber(iso) - d0) / span) * (W - L - R);
  const y = (kg: number) => T + (1 - (kg - lo) / (hi - lo)) * (H - T - B);
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 1) ticks.push(t);

  const line = points.map((p) => `${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const area = `${x(first.date).toFixed(1)},${(H - B).toFixed(1)} ${line} ${x(last.date).toFixed(1)},${(H - B).toFixed(1)}`;
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;
  const summary = `Weight fell from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}.`;

  return (
    <Column gap="16" fillWidth>
      <Row gap="8" vertical="end" wrap>
        <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
          {last.kg} kg
        </Text>
        <Text textVariant="label-strong-m" onBackground={change < 0 ? "warning-strong" : "neutral-medium"}>
          {change > 0 ? "+" : "−"}
          {Math.abs(change).toFixed(1)} kg ({Math.abs(pct).toFixed(1)}%) since {fmtShortDate(first.date)}
        </Text>
      </Row>
      <Row fillWidth onBackground="neutral-medium">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={summary} style={{ display: "block", height: "auto" }}>
          <title>{summary}</title>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.18} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={13} fill="currentColor">
                {t}
              </text>
            </g>
          ))}
          <polygon points={area} fill="var(--brand-solid-strong)" fillOpacity={0.1} />
          <polyline points={line} fill="none" stroke="var(--brand-solid-strong)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => {
            const isLast = i === points.length - 1;
            return (
              <g key={p.date}>
                <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill="var(--brand-solid-strong)" />
                <text x={x(p.date)} y={y(p.kg) - 12} textAnchor={isLast ? "end" : "middle"} fontSize={14} fontWeight={isLast ? 700 : 500} fill="currentColor">
                  {p.kg}
                </text>
                <text x={x(p.date)} y={H - 16} textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"} fontSize={14} fill="currentColor" fillOpacity={0.8}>
                  {fmtShortDate(p.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </Row>
      <Column as="ul" gap="4" style={{ margin: 0, padding: 0, listStyle: "none" }} aria-label="Weight readings">
        {[...points].reverse().map((p, i, arr) => {
          const prev = arr[i + 1];
          const diff = prev ? p.kg - prev.kg : null;
          return (
            <Row as="li" key={p.date} horizontal="between" gap="12" paddingY="4" borderBottom={i < arr.length - 1 ? true : false}>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {fmtDate(p.date)}
              </Text>
              <Text textVariant="label-strong-s" style={{ fontVariantNumeric: "tabular-nums" }}>
                {p.kg} kg
                {diff !== null ? ` (${diff < 0 ? "−" : "+"}${Math.abs(diff).toFixed(1)})` : ""}
              </Text>
            </Row>
          );
        })}
      </Column>
    </Column>
  );
}
