import { formatDate } from "@/lib/data";

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 640;
  const H = 240;
  const pad = { l: 44, r: 28, t: 28, b: 38 };
  const times = points.map((p) => new Date(`${p.date}T00:00:00Z`).getTime());
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.6);
  const hi = Math.ceil(Math.max(...kgs) + 0.4);
  const x = (t: number) => pad.l + ((t - t0) / (t1 - t0 || 1)) * (W - pad.l - pad.r);
  const y = (kg: number) => pad.t + (1 - (kg - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(v);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(times[i]).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const summary = `Weight in kilograms over ${points.length} visits: ${points
    .map((p) => `${formatDate(p.date, { month: "short", year: "numeric" })} ${p.kg}`)
    .join(", ")}.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full text-foreground">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={1} />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
            {v}
          </text>
        </g>
      ))}
      <path d={path} fill="none" className="stroke-teal-700 dark:stroke-teal-400" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const isLast = p === last;
        const anchor = p === first ? "start" : isLast ? "end" : "middle";
        return (
          <g key={p.date}>
            <circle cx={x(times[i])} cy={y(p.kg)} r={isLast ? 6 : 4.5} className={isLast ? "fill-teal-700 stroke-background dark:fill-teal-400" : "fill-background stroke-teal-700 dark:stroke-teal-400"} strokeWidth={2.5} />
            <text x={x(times[i])} y={y(p.kg) - 12} textAnchor={anchor} className="fill-foreground text-[12px] font-semibold">
              {p.kg}
            </text>
            <text x={x(times[i])} y={H - 14} textAnchor={anchor} className="fill-muted-foreground text-[11px]">
              {formatDate(p.date, { month: "short", year: "2-digit" })}
            </text>
          </g>
        );
      })}
      <text x={4} y={14} className="fill-muted-foreground text-[11px]">
        kg
      </text>
    </svg>
  );
}
