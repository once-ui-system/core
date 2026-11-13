import { TrendingDown, TrendingUp } from "lucide-react";
import { fmtDate } from "@/lib/data";

interface Point {
  date: string;
  kg: number;
}

const W = 420;
const H = 250;
const PAD = { l: 62, r: 40, t: 26, b: 34 };

export function WeightChart({ points, name }: { points: Point[]; name: string }) {
  if (points.length === 0) return <p className="text-sm text-slate-600">No weights recorded.</p>;

  const t = (d: string) => new Date(`${d}T00:00:00Z`).getTime();
  const t0 = t(points[0].date);
  const t1 = t(points[points.length - 1].date);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (d: string) => PAD.l + (t1 === t0 ? 0.5 : (t(d) - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
  const y = (kg: number) => PAD.t + (1 - (kg - lo) / (hi - lo)) * (H - PAD.t - PAD.b);

  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(v);

  const line = points.map((p) => `${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const base = H - PAD.b;
  const area = `${x(points[0].date).toFixed(1)},${base} ${line} ${x(points[points.length - 1].date).toFixed(1)},${base}`;

  const first = points[0];
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const delta = last.kg - first.kg;
  const pct = (delta / first.kg) * 100;
  const Trend = delta <= 0 ? TrendingDown : TrendingUp;
  const sign = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "");
  const short = (d: string) => fmtDate(d, { month: "short", year: "2-digit" }).replace(" ", " '");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="text-4xl font-bold tabular-nums tracking-tight">
          {last.kg.toFixed(1)}
          <span className="ml-1 text-lg font-semibold text-slate-600">kg today</span>
        </p>
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 ring-1 ring-amber-300">
            <Trend aria-hidden className="size-4" />
            {sign(delta)}
            {Math.abs(delta).toFixed(1)} kg ({sign(pct)}
            {Math.abs(pct).toFixed(1)}%)
          </span>
          <span className="font-normal text-slate-600">since {fmtDate(first.date, { month: "short", year: "numeric" })}</span>
        </p>
        {prev && (
          <p className="text-sm text-slate-600">
            {sign(last.kg - prev.kg)}
            {Math.abs(last.kg - prev.kg).toFixed(1)} kg since last visit
          </p>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${name}'s weight over ${points.length} visits, from ${first.kg} kg to ${last.kg} kg`} className="h-auto w-full max-w-2xl">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l - 30} x2={W - PAD.r + 20} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.l - 36} y={y(v) + 4} textAnchor="end" fontSize={11} fill="#475569">
              {v}
            </text>
          </g>
        ))}
        <polygon points={area} fill="#0f766e" opacity={0.1} />
        <polyline points={line} fill="none" stroke="#0f766e" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill={isLast ? "#0f766e" : "#fff"} stroke="#0f766e" strokeWidth={2.5} />
              <text x={x(p.date)} y={y(p.kg) - 11} textAnchor="middle" fontSize={12} fontWeight={isLast ? 700 : 600} fill="#0f172a">
                {p.kg.toFixed(1)}
              </text>
              <text x={x(p.date)} y={H - 12} textAnchor="middle" fontSize={11} fill="#475569">
                {short(p.date)}
              </text>
            </g>
          );
        })}
      </svg>

      <table className="sr-only">
        <caption>Weight history for {name}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{fmtDate(p.date)}</td>
              <td>{p.kg.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
