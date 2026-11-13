"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate, formatMonthYear, type WeightPoint } from "@/lib/data";

const HEIGHT = 240;
const PAD = { left: 42, right: 22, top: 30, bottom: 36 };

export function WeightChart({ points, name }: { points: WeightPoint[]; name: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.max(280, Math.round(w)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const values = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...values) - 0.5);
  const hi = Math.ceil(Math.max(...values) + 0.5);
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (kg: number) => PAD.top + (1 - (kg - lo) / (hi - lo)) * innerH;

  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 1) ticks.push(t);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div ref={wrapRef} className="w-full">
      <svg
        role="img"
        aria-labelledby="weight-chart-title weight-chart-desc"
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="block max-w-full"
      >
        <title id="weight-chart-title">{`${name}'s weight over ${points.length} visits`}</title>
        <desc id="weight-chart-desc">
          {`From ${first.kg} kilograms on ${formatDate(first.date)} to ${last.kg} kilograms on ${formatDate(last.date)}.`}
        </desc>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
              {t}
            </text>
          </g>
        ))}
        <path d={area} className="fill-primary/10" />
        <path d={line} className="fill-none stroke-primary" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <circle cx={x(i)} cy={y(p.kg)} r={isLast ? 6 : 4} className={isLast ? "fill-primary stroke-background" : "fill-background stroke-primary"} strokeWidth={2} />
              <text
                x={x(i)}
                y={y(p.kg) - 12}
                textAnchor="middle"
                className={isLast ? "fill-foreground text-[12px] font-semibold tabular-nums" : "fill-muted-foreground text-[11px] tabular-nums"}
              >
                {p.kg.toFixed(1)}
              </text>
              <text x={x(i)} y={HEIGHT - 12} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {formatMonthYear(p.date)}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{`${name}'s weight by visit date, in kilograms`}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{formatDate(p.date)}</td>
              <td>{p.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
