import { fmtDate, fmtMonthYear } from "@/lib/data";

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 560;
  const H = 250;
  const pad = { l: 40, r: 28, t: 30, b: 42 };
  const times = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (t: number) => pad.l + ((t - t0) / (t1 - t0 || 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((hi - v) / (hi - lo)) * (H - pad.t - pad.b);
  const coords = points.map((p, i) => ({ ...p, cx: x(times[i]), cy: y(p.kg) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].cx.toFixed(1)} ${H - pad.b} L${coords[0].cx.toFixed(1)} ${H - pad.b} Z`;
  const grid: number[] = [];
  for (let v = lo; v <= hi; v += 1) grid.push(v);

  const first = points[0];
  const last = points[points.length - 1];
  const summary = `Weight fell from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}.`;

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full">
        {grid.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-stone-200" strokeWidth={1} />
            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize={12} className="fill-stone-600">
              {v}
            </text>
          </g>
        ))}
        <path d={area} className="fill-teal-600/10" />
        <path d={line} fill="none" className="stroke-teal-700" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => {
          const isLast = i === coords.length - 1;
          return (
            <g key={c.date}>
              <circle cx={c.cx} cy={c.cy} r={isLast ? 6 : 4.5} className={isLast ? "fill-teal-700 stroke-white" : "fill-white stroke-teal-700"} strokeWidth={2.5} />
              <text x={c.cx} y={c.cy - 12} textAnchor="middle" fontSize={13} fontWeight={isLast ? 700 : 600} className="fill-stone-900">
                {c.kg}
              </text>
              <text x={c.cx} y={H - pad.b + 20} textAnchor="middle" fontSize={12} className="fill-stone-600">
                {fmtMonthYear(c.date)}
              </text>
            </g>
          );
        })}
        <text x={pad.l - 8} y={14} textAnchor="end" fontSize={12} className="fill-stone-600">
          kg
        </text>
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
