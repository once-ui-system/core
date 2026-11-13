import { fmtDate, type WeightPoint } from "@/lib/data";

const W = 420;
const H = 230;
const L = 40;
const R = 18;
const T = 28;
const B = 38;

export function WeightChart({ points }: { points: WeightPoint[] }) {
  const times = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (t: number) => L + ((t - t0) / (t1 - t0)) * (W - L - R);
  const y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B);

  const coords = points.map((p, i) => ({ ...p, cx: x(times[i]), cy: y(p.kg) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].cx.toFixed(1)} ${H - B} L${coords[0].cx.toFixed(1)} ${H - B} Z`;
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(v);
  const last = coords[coords.length - 1];

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Weight trend: ${points
          .map((p) => `${p.kg} kilograms on ${fmtDate(p.date)}`)
          .join("; ")}.`}
        className="h-auto w-full"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-slate-200" strokeWidth={1} />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-slate-600" fontSize={11}>
              {v}
            </text>
          </g>
        ))}
        <path d={area} className="fill-teal-600/10" />
        <path d={line} fill="none" className="stroke-teal-700" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <g key={c.date}>
            <circle
              cx={c.cx}
              cy={c.cy}
              r={i === coords.length - 1 ? 5.5 : 4}
              className={i === coords.length - 1 ? "fill-teal-800 stroke-white" : "fill-white stroke-teal-700"}
              strokeWidth={2}
            />
            <text x={c.cx} y={c.cy - 10} textAnchor="middle" className="fill-slate-900" fontSize={11} fontWeight={600}>
              {c.kg}
            </text>
            <text x={c.cx} y={H - B + 16} textAnchor="middle" className="fill-slate-600" fontSize={11}>
              {fmtDate(c.date, { month: "short", year: "2-digit", timeZone: "UTC" })}
            </text>
          </g>
        ))}
        <text x={L} y={12} className="fill-slate-600" fontSize={11}>
          kg
        </text>
        <title>{`Latest weight ${last.kg} kg`}</title>
      </svg>
    </figure>
  );
}
