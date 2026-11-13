import { Column, Grid, Row, Text } from "@once-ui-system/core";
import { daysBetween, formatDate } from "@/lib/data";

const W = 600;
const H = 180;
const PAD = 16;

export function WeightTrend({ points }: { points: { date: string; kg: number }[] }) {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const span = Math.max(1, daysBetween(first.date, last.date));
  const kgs = points.map((p) => p.kg);
  const lo = Math.min(...kgs) - 0.6;
  const hi = Math.max(...kgs) + 0.6;
  const xy = points.map((p) => ({
    x: PAD + (daysBetween(first.date, p.date) / span) * (W - PAD * 2),
    y: PAD + (1 - (p.kg - lo) / (hi - lo)) * (H - PAD * 2),
  }));
  const line = xy.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${W - PAD},${H - PAD}`;
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;

  return (
    <Column gap="16">
      <Row gap="12" vertical="end" wrap>
        <Text textVariant="display-strong-xs">{last.kg.toFixed(1)} kg</Text>
        <Text textVariant="label-strong-m" onBackground="warning-strong">
          {change.toFixed(1)} kg ({pct.toFixed(1)}%) since {formatDate(first.date)}
        </Text>
      </Row>
      <Row fillWidth onBackground="brand-strong">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`Weight over ${points.length} visits, from ${first.kg} kg on ${formatDate(first.date)} to ${last.kg} kg on ${formatDate(last.date)}`}
          style={{ display: "block", height: "auto" }}>
          <polygon points={area} fill="currentColor" opacity={0.12} />
          <polyline points={line} fill="none" stroke="currentColor" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {xy.map((p, i) => (
            <circle
              key={points[i].date}
              cx={p.x}
              cy={p.y}
              r={i === xy.length - 1 ? 7 : 5}
              fill="currentColor"
              stroke="var(--surface-background)"
              strokeWidth={2}
            />
          ))}
        </svg>
      </Row>
      <Grid columns="6" s={{ columns: "3" }} gap="8" as="ol" margin="0" padding="0" style={{ listStyle: "none" }}>
        {points.map((p) => (
          <Column as="li" key={p.date} gap="2">
            <Text textVariant="label-strong-m">{p.kg.toFixed(1)} kg</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {formatDate(p.date)}
            </Text>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
