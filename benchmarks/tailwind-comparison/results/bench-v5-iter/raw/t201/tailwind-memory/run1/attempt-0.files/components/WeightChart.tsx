import { daysBetween, fmtDate } from "@/lib/data";

const W = 440;
const H = 240;
const PAD = { l: 44, r: 22, t: 28, b: 36 };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortLabel(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const span = Math.max(1, daysBetween(first.date, last.date));
  const lo = Math.floor(Math.min(...points.map((p) => p.kg)) - 0.5);
  const hi = Math.ceil(Math.max(...points.map((p) => p.kg)) + 0.5);
  const x = (d: string) => PAD.l + (daysBetween(first.date, d) / span) * (W - PAD.l - PAD.r);
  const y = (kg: number) => PAD.t + (1 - (kg - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(v);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;

  return (
    <figure>
      <figcaption className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-3xl font-bold tabular-nums text-slate-900">{last.kg.toFixed(1)} kg</span>
        <span className="text-sm font-semibold text-red-800">
          {change.toFixed(1)} kg ({pct.toFixed(0)}%) since {fmtDate(first.date)}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Weight over ${points.length} visits, from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}`}
        className="mt-2 h-auto w-full"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" fontSize={12} fill="#475569">
              {v}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="#0f766e" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill={isLast ? "#0f766e" : "#fff"} stroke="#0f766e" strokeWidth={2.5} />
              <text x={x(p.date)} y={y(p.kg) - 11} textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"} fontSize={12} fontWeight={600} fill="#16212b">
                {p.kg}
              </text>
              <text x={x(p.date)} y={H - 12} textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"} fontSize={11.5} fill="#475569">
                {shortLabel(p.date)}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Weight by visit</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{fmtDate(p.date)}</td>
              <td>{p.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
