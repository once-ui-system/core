"use client";

import { useEffect, useRef, useState } from "react";
import { fmtDate, fmtMonthYear, type Weight } from "@/lib/data";

const MARGIN = { top: 30, right: 26, bottom: 34, left: 40 };

export function WeightChart({ points, name }: { points: Weight[]; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = width < 480 ? 220 : 270;
  const n = points.length;
  const time = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = time[0];
  const t1 = time[n - 1];
  const kgs = points.map((p) => p.kg);
  const yMin = Math.floor(Math.min(...kgs) - 0.5);
  const yMax = Math.ceil(Math.max(...kgs) + 0.5);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const x = (i: number) => MARGIN.left + (t1 === t0 ? 0 : ((time[i] - t0) / (t1 - t0)) * innerW);
  const y = (kg: number) => MARGIN.top + (1 - (kg - yMin) / (yMax - yMin)) * innerH;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax; v += 1) ticks.push(v);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)} ${MARGIN.top + innerH} L${x(0).toFixed(1)} ${MARGIN.top + innerH} Z`;
  const narrow = width < 480;
  const showX = (i: number) => !narrow || i === 0 || i === n - 1 || (i % 2 === 0 && i < n - 2);

  const first = points[0];
  const last = points[n - 1];

  return (
    <div>
      <div ref={ref} className="w-full">
        <svg
          role="img"
          aria-label={`${name}'s weight over ${n} visits: from ${first.kg} kilograms on ${fmtDate(first.date)} to ${last.kg} kilograms on ${fmtDate(last.date)}`}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
        >
          {ticks.map((v) => (
            <g key={v}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(v)} y2={y(v)} className="stroke-slate-200" strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(v) + 4} textAnchor="end" fontSize={12} className="fill-slate-600">
                {v}
              </text>
            </g>
          ))}
          <text x={MARGIN.left - 8} y={14} textAnchor="end" fontSize={11} fontWeight={700} className="fill-slate-600">
            kg
          </text>
          <path d={area} className="fill-teal-700/10" />
          <path d={line} fill="none" className="stroke-teal-700" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => {
            const isLast = i === n - 1;
            return (
              <g key={p.date}>
                <circle
                  cx={x(i)}
                  cy={y(p.kg)}
                  r={isLast ? 6 : 4.5}
                  className={isLast ? "fill-red-700 stroke-red-700" : "fill-white stroke-teal-700"}
                  strokeWidth={2.5}
                />
                <text
                  x={i === 0 ? x(i) - 6 : x(i)}
                  y={y(p.kg) - 11}
                  textAnchor={i === 0 ? "start" : "middle"}
                  fontSize={12}
                  fontWeight={isLast ? 800 : 600}
                  className={isLast ? "fill-red-700" : "fill-slate-900"}
                >
                  {p.kg.toFixed(1)}
                </text>
                {showX(i) && (
                  <text x={x(i)} y={height - 10} textAnchor="middle" fontSize={12} className="fill-slate-600">
                    {fmtMonthYear(p.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <table className="sr-only">
        <caption>{name}&rsquo;s recorded weights</caption>
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
              <td>{p.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
