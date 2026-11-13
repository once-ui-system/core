import { formatDate, monthYear } from "@/lib/data";

export default function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 480;
  const H = 240;
  const pl = 40;
  const pr = 26;
  const pt = 30;
  const pb = 46;
  const times = points.map((p) => Date.parse(p.date));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (t: number) => pl + ((t - t0) / (t1 - t0 || 1)) * (W - pl - pr);
  const y = (kg: number) => pt + ((hi - kg) / (hi - lo)) * (H - pt - pb);
  const grid: number[] = [];
  for (let g = lo; g <= hi; g += 1) grid.push(g);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(Date.parse(p.date)).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const label = `Weight in kilograms from ${formatDate(first.date)} (${first.kg}) to ${formatDate(last.date)} (${last.kg})`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="pp-chart">
      {grid.map((g) => (
        <g key={g}>
          <line x1={pl} x2={W - pr} y1={y(g)} y2={y(g)} stroke="#dbe3e0" strokeWidth="1" />
          <text x={pl - 8} y={y(g) + 4} textAnchor="end" fontSize="12" fill="#55635e">
            {g}
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const cx = x(Date.parse(p.date));
        const isLast = i === points.length - 1;
        return (
          <g key={p.date}>
            <circle cx={cx} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill={isLast ? "#0f766e" : "#fff"} stroke="#0f766e" strokeWidth="2.5" />
            <text x={cx} y={y(p.kg) - 12} textAnchor="middle" fontSize="13" fontWeight={isLast ? 700 : 500} fill="#14211d">
              {p.kg.toFixed(1)}
            </text>
            <text x={cx} y={H - 22} textAnchor="middle" fontSize="12" fill="#55635e">
              {monthYear(p.date).split(" ")[0]}
            </text>
            <text x={cx} y={H - 8} textAnchor="middle" fontSize="12" fill="#55635e">
              {monthYear(p.date).split(" ")[1]}
            </text>
          </g>
        );
      })}
      <text x={pl - 8} y={14} textAnchor="end" fontSize="12" fill="#55635e">
        kg
      </text>
    </svg>
  );
}
