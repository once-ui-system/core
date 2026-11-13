import { dayNumber, formatDate, type Weight } from "@/lib/data";

/** Weight over visits, drawn as inline SVG so it needs no chart library. */
export function WeightChart({ points, name }: { points: Weight[]; name: string }) {
  const W = 560;
  const H = 260;
  const padL = 44;
  const padR = 28;
  const padT = 36;
  const padB = 48;

  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 1);
  const hi = Math.ceil(Math.max(...kgs) + 1);
  const d0 = dayNumber(points[0].date);
  const d1 = dayNumber(points[points.length - 1].date);

  const x = (date: string) => padL + ((dayNumber(date) - d0) / (d1 - d0 || 1)) * (W - padL - padR);
  const y = (kg: number) => padT + ((hi - kg) / (hi - lo)) * (H - padT - padB);

  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 2) ticks.push(t);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points[points.length - 1].date).toFixed(1)} ${H - padB} L${x(points[0].date).toFixed(1)} ${H - padB} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const summary = `${name}'s weight fell from ${first.kg.toFixed(1)} kilograms on ${formatDate(first.date)} to ${last.kg.toFixed(1)} kilograms on ${formatDate(last.date)} across ${points.length} visits.`;

  return (
    <div
      role="region"
      aria-label={`Weight trend for ${name}, scrollable`}
      tabIndex={0}
      style={{ overflowX: "auto", maxWidth: "100%" }}
    >
      <svg
        role="img"
        aria-label={summary}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", minWidth: "26rem", height: "auto" }}
      >
        <title>{summary}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--neutral-alpha-medium)" strokeDasharray="3 4" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="var(--neutral-on-background-weak)">
              {t}
            </text>
          </g>
        ))}
        <path d={area} fill="var(--brand-alpha-weak)" />
        <path d={line} fill="none" stroke="var(--brand-solid-strong)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill="var(--brand-solid-strong)" />
              <text
                x={x(p.date)}
                y={y(p.kg) - 12}
                textAnchor="middle"
                fontSize="14"
                fontWeight={isLast ? 700 : 500}
                fill="var(--neutral-on-background-strong)"
              >
                {p.kg.toFixed(1)}
              </text>
              <text x={x(p.date)} y={H - padB + 22} textAnchor="middle" fontSize="12" fill="var(--neutral-on-background-weak)">
                {formatDate(p.date, "month")}
              </text>
            </g>
          );
        })}
        <text x={padL} y={14} fontSize="12" fill="var(--neutral-on-background-weak)">
          kg
        </text>
      </svg>
    </div>
  );
}
