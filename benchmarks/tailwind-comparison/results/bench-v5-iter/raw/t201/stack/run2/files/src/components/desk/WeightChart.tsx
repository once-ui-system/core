import { Column, Row, Text } from "@once-ui-system/core";
import { fmtDate } from "@/lib/data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function short(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 640;
  const H = 240;
  const padL = 44;
  const padR = 24;
  const padT = 28;
  const padB = 36;
  const kgs = points.map((p) => p.kg);
  const min = Math.floor(Math.min(...kgs) - 0.5);
  const max = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, points.length - 1);
  const y = (kg: number) => padT + ((max - kg) * (H - padT - padB)) / (max - min);
  const line = points.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const diff = last.kg - first.kg;
  const ticks = [min, (min + max) / 2, max];

  return (
    <Column gap="12">
      <Row gap="8" vertical="end" wrap>
        <Text variant="display-strong-xs">{last.kg} kg</Text>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {diff < 0 ? "down" : "up"} {Math.abs(diff).toFixed(1)} kg since {fmtDate(first.date)}
        </Text>
      </Row>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Weight in kilograms: ${points.map((p) => `${fmtDate(p.date)} ${p.kg}`).join(", ")}`}
        style={{ color: "var(--neutral-on-background-weak)", display: "block" }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--neutral-alpha-weak)" strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="currentColor">
              {t}
            </text>
          </g>
        ))}
        <polyline fill="none" stroke="var(--brand-solid-strong)" strokeWidth="3" strokeLinejoin="round" points={line} />
        {points.map((p, i) => (
          <g key={p.date}>
            <circle cx={x(i)} cy={y(p.kg)} r="5" fill="var(--brand-solid-strong)" />
            <text x={x(i)} y={y(p.kg) - 12} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--neutral-on-background-strong)">
              {p.kg}
            </text>
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="12" fill="currentColor">
              {short(p.date)}
            </text>
          </g>
        ))}
      </svg>
    </Column>
  );
}
