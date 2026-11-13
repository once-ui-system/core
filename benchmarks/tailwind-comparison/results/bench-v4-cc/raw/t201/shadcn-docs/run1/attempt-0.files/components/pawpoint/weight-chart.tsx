import { formatDate, formatShortDate, type Weight } from "@/lib/data";

export function WeightChart({ points, name }: { points: Weight[]; name: string }) {
  const W = 600;
  const H = 180;
  const padX = 14;
  const padY = 18;

  const times = points.map((p) => Date.parse(p.date));
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);

  const x = (t: number) => padX + ((t - tMin) / (tMax - tMin || 1)) * (W - padX * 2);
  const y = (kg: number) => padY + ((hi - kg) / (hi - lo || 1)) * (H - padY * 2);

  const coords = points.map((p) => ({ ...p, cx: x(Date.parse(p.date)), cy: y(p.kg) }));
  const line = coords.map((c) => `${c.cx.toFixed(1)},${c.cy.toFixed(1)}`).join(" ");
  const area = `${coords[0].cx.toFixed(1)},${H - padY} ${line} ${coords[coords.length - 1].cx.toFixed(1)},${H - padY}`;
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 2) ticks.push(t);

  const first = points[0];
  const last = points[points.length - 1];
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;

  return (
    <div>
      <p className="text-sm">
        <span className="text-2xl font-semibold tabular-nums">{last.kg.toFixed(1)} kg</span>{" "}
        <span className="font-medium text-amber-800">
          down {Math.abs(change).toFixed(1)} kg ({Math.abs(pct).toFixed(1)}%) since {formatDate(first.date)}
        </span>
      </p>

      <div className="relative mt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-labelledby="wt-title wt-desc">
          <title id="wt-title">{name}&apos;s weight over {points.length} visits</title>
          <desc id="wt-desc">
            {points.map((p) => `${formatDate(p.date)}: ${p.kg} kilograms`).join(". ")}.
          </desc>
          {ticks.map((t) => (
            <line key={t} x1={0} x2={W} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} strokeDasharray="4 4" />
          ))}
          <polygon points={area} className="fill-primary/10" />
          <polyline points={line} fill="none" className="stroke-primary" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {coords.map((c, i) => (
            <circle
              key={c.date}
              cx={c.cx}
              cy={c.cy}
              r={i === coords.length - 1 ? 7 : 5}
              className={i === coords.length - 1 ? "fill-primary stroke-background" : "fill-background stroke-primary"}
              strokeWidth={3}
            />
          ))}
        </svg>
        {ticks.map((t) => (
          <span
            key={t}
            aria-hidden="true"
            className="absolute left-0 -translate-y-full rounded bg-card/80 px-1 text-[11px] tabular-nums text-muted-foreground"
            style={{ top: `${(y(t) / H) * 100}%` }}
          >
            {t} kg
          </span>
        ))}
      </div>

      <ol className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {points.map((p, i) => {
          const delta = i === 0 ? null : p.kg - points[i - 1].kg;
          const isLast = i === points.length - 1;
          return (
            <li key={p.date} className={`rounded-lg border p-2 text-center ${isLast ? "border-primary bg-primary/5" : "bg-background"}`}>
              <p className="text-[11px] text-muted-foreground">{formatShortDate(p.date)}</p>
              <p className="text-sm font-semibold tabular-nums">{p.kg.toFixed(1)}</p>
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {delta === null ? "first" : `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)}`}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
