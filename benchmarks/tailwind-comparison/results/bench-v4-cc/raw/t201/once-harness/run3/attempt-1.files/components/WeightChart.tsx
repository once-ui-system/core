import { Column, Row, Text } from "@once-ui-system/core";
import type { Weight } from "@/lib/data";
import { daysBetween, formatDate } from "@/lib/time";

const W = 600;
const H = 180;
const PAD = 16;

export function WeightChart({ weights }: { weights: Weight[] }) {
  if (weights.length === 0) return null;
  const first = weights[0];
  const last = weights[weights.length - 1];
  const kgs = weights.map((w) => w.kg);
  const min = Math.floor(Math.min(...kgs) - 0.5);
  const max = Math.ceil(Math.max(...kgs) + 0.5);
  const span = Math.max(1, daysBetween(first.date, last.date));

  const points = weights.map((w) => ({
    x: PAD + (daysBetween(first.date, w.date) / span) * (W - PAD * 2),
    y: PAD + (1 - (w.kg - min) / (max - min)) * (H - PAD * 2),
    ...w,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1].x.toFixed(1)} ${H - PAD} L${points[0].x.toFixed(1)} ${H - PAD} Z`;

  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;
  const months = Math.round(span / 30.44);
  const summary = `Weight went from ${first.kg} kg on ${formatDate(first.date)} to ${last.kg} kg on ${formatDate(last.date)}, a change of ${change.toFixed(1)} kg over ${months} months.`;

  return (
    <Column gap="16" fillWidth>
      <Row horizontal="between" vertical="end" wrap gap="8">
        <Column gap="2">
          <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
            {last.kg.toFixed(1)} kg
          </Text>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            on {formatDate(last.date)}
          </Text>
        </Column>
        <Text textVariant="label-strong-m" onBackground="danger-strong" style={{ fontVariantNumeric: "tabular-nums" }}>
          {change.toFixed(1).replace("-", "−")} kg ({pct.toFixed(1).replace("-", "−")}%) in {months} months
        </Text>
      </Row>

      <Row onBackground="brand-strong" fillWidth>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={summary}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {[0, 1, 2, 3].map((i) => {
            const y = PAD + (i / 3) * (H - PAD * 2);
            return <line key={i} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.15" />;
          })}
          <path d={area} fill="currentColor" fillOpacity="0.12" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={p.date} cx={p.x} cy={p.y} r={i === points.length - 1 ? 7 : 4.5} fill="currentColor" />
          ))}
        </svg>
      </Row>

      <Row horizontal="between">
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Scale {min} to {max} kg
        </Text>
      </Row>

      <Column as="ul" gap="0">
        {[...weights].reverse().map((w, i, arr) => {
          const prev = arr[i + 1];
          const delta = prev ? w.kg - prev.kg : null;
          return (
            <Row
              as="li"
              key={w.date}
              horizontal="between"
              vertical="center"
              paddingY="8"
              borderTop={i === 0 ? false : true}
              gap="12"
            >
              <Text textVariant="body-default-m">{formatDate(w.date)}</Text>
              <Row gap="16" vertical="center">
                <Text textVariant="label-strong-m" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {w.kg.toFixed(1)} kg
                </Text>
                <Text
                  textVariant="body-default-s"
                  onBackground={delta !== null && delta < 0 ? "danger-strong" : "neutral-weak"}
                  style={{ fontVariantNumeric: "tabular-nums", minWidth: "4.5rem", textAlign: "right" }}
                >
                  {delta === null ? "first" : `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)} kg`}
                </Text>
              </Row>
            </Row>
          );
        })}
      </Column>
    </Column>
  );
}
