"use client";

import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { cssColor } from "../../internal/cssColor.js";
import { usePlotSize } from "./CartesianPlot.js";
import styles from "./Chart.module.css";
import { DataTooltip } from "./DataTooltip.js";
import { RadialGradient } from "./Gradient.js";
import type { ChartProps, ChartVariant, DataPoint, DateConfig } from "./interfaces.js";
import { Legend } from "./Legend.js";
import { getDistributedColor } from "./utils/colorDistribution.js";
import { sectorPath } from "./utils/scale.js";

export interface PiePlotProps {
  id: string;
  rows: readonly DataPoint[];
  dataKey: string;
  nameKey: string;
  variant: ChartVariant;
  legend: {
    display: boolean;
    position: NonNullable<NonNullable<ChartProps["legend"]>["position"]>;
    direction?: "row" | "column";
  };
  tooltip: boolean;
  date?: DateConfig;
  formatValue?: (value: number, key?: string) => string;
  ring: { inner: number; outer: number };
  origo: { x: number; y: number };
  gradientId: (colorKey: string) => string;
}

/**
 * PieChart's plot: one SVG sector per row, counter-clockwise from three
 * o'clock, `ring` sized in percent of the largest circle that fits. It draws
 * on the server at the default size and at its measured size in the browser.
 */
export function PiePlot({
  id,
  rows,
  dataKey,
  nameKey,
  variant,
  legend,
  tooltip,
  date,
  formatValue,
  ring,
  origo,
  gradientId,
}: PiePlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { width: W, height: H } = usePlotSize(ref);
  const [hidden, setHidden] = useState<number[]>([]);
  const [active, setActive] = useState<{ index: number; x?: number; y?: number } | null>(null);

  // Recharts' 5px margin round the pie; a missing `origo` axis is the middle.
  const ox = origo.x ?? 50;
  const oy = origo.y ?? 50;
  const cx = 5 + ((W - 10) * ox) / 100;
  const cy = 5 + ((H - 10) * oy) / 100;
  const max = Math.max(0, Math.min(W, H) - 10) / 2;
  const inner = (ring.inner / 100) * max;
  const outer = (ring.outer / 100) * max;
  const colorKey = (row: DataPoint, i: number) =>
    String(row.color || getDistributedColor(i, rows.length));
  const sizeOf = (row: DataPoint) => {
    const v = row[dataKey];
    return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0;
  };
  const total = rows.reduce((sum, row, i) => sum + (hidden.includes(i) ? 0 : sizeOf(row)), 0);
  let angle = 0;
  const sectors = rows.map((row, i) => {
    const sweep = hidden.includes(i) || !total ? 0 : (sizeOf(row) / total) * 360;
    const start = angle;
    angle += sweep;
    return { row, i, start, sweep, color: cssColor(colorKey(row, i), "data-") };
  });

  const onKeyDown = (event: React.KeyboardEvent) => {
    const shown = sectors.filter((s) => s.sweep > 0).map((s) => s.i);
    if (!tooltip || !shown.length) return;
    const at = active ? shown.indexOf(active.index) : -1;
    let next: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = shown[(at + 1) % shown.length];
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = shown[(at - 1 + shown.length) % shown.length];
    else if (event.key === "Escape") return setActive(null);
    if (next === undefined) return;
    event.preventDefault();
    setActive({ index: next });
  };

  // The tooltip sits beside the pointer, or the slice's middle from the keyboard.
  useLayoutEffect(() => {
    const el = tooltipRef.current;
    const box = ref.current;
    if (!el || !box || !active) return;
    const s = sectors[active.index];
    const mid = (-(s.start + s.sweep / 2) * Math.PI) / 180;
    const r = (inner + outer) / 2;
    const scale = Math.min(box.clientWidth / W, box.clientHeight / H) || 1;
    const x = active.x ?? box.clientWidth / 2 + (cx - W / 2 + r * Math.cos(mid)) * scale;
    const y = active.y ?? box.clientHeight / 2 + (cy - H / 2 + r * Math.sin(mid)) * scale;
    let left = x + 10;
    if (left + el.offsetWidth > box.clientWidth) left = Math.max(0, x - el.offsetWidth - 10);
    const top = Math.max(0, Math.min(y + 10, box.clientHeight - el.offsetHeight));
    el.style.transform = `translate(${left}px, ${top}px)`;
  });

  const point = (event: React.PointerEvent, index: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!tooltip || !box) return;
    setActive({ index, x: event.clientX - box.left, y: event.clientY - box.top });
  };

  const activeSector = active ? sectors[active.index] : undefined;
  const legendTop = legend.position.startsWith("top");

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the arrow keys move the tooltip between slices.
    <div
      ref={ref}
      className={styles.plot}
      tabIndex={tooltip ? 0 : undefined}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
    >
      <svg
        className={`${styles.svg} ${styles.sweep}`}
        style={
          {
            "--chart-cx": `${(cx / W) * 100}%`,
            "--chart-cy": `${(cy / H) * 100}%`,
            "--chart-delay": "400ms",
          } as React.CSSProperties
        }
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern id={`pieMaster${id}`} patternUnits="userSpaceOnUse" width="100%" height="100%">
            <RadialGradient
              id={`pieMasterGradient${id}`}
              color="var(--page-background)"
              variant={variant}
            />
            <rect width="100%" height="100%" fill={`url(#pieMasterGradient${id})`} />
          </pattern>
          {Array.from(new Set(rows.map(colorKey))).map((key) => (
            <pattern
              id={gradientId(key)}
              key={key}
              patternUnits="userSpaceOnUse"
              width="100%"
              height="100%"
            >
              {variant !== "outline" && (
                <rect width="100%" height="100%" fill={cssColor(key, "data-")} />
              )}
              {variant === "gradient" && (
                <rect width="100%" height="100%" fill={`url(#pieMaster${id})`} />
              )}
            </pattern>
          ))}
        </defs>
        {sectors.map((s) =>
          s.sweep > 0 ? (
            <path
              key={s.i}
              d={sectorPath(cx, cy, inner, outer, s.start, s.start + s.sweep)}
              fill={
                variant === "outline" ? "transparent" : `url(#${gradientId(colorKey(s.row, s.i))})`
              }
              stroke={s.color}
              strokeWidth={variant === "outline" ? 2 : 1}
              onPointerMove={(event) => point(event, s.i)}
              onPointerLeave={() => setActive(null)}
            />
          ) : null,
        )}
      </svg>
      {legend.display && (
        <div
          style={{
            position: "absolute",
            top: legendTop ? 0 : undefined,
            bottom: legendTop ? undefined : 0,
            left: 0,
            right: 0,
          }}
        >
          <Legend
            payload={rows.map((row) => ({ value: row[nameKey] }))}
            variant={variant}
            position={legend.position}
            direction={legend.direction}
            labels="none"
            colors={rows.map((row, i) => cssColor(colorKey(row, i), "data-"))}
            hidden={rows.map((_, i) => hidden.includes(i))}
            onToggle={
              rows.length > 1
                ? (i) => setHidden((h) => (h.includes(i) ? h.filter((k) => k !== i) : [...h, i]))
                : undefined
            }
          />
        </div>
      )}
      {tooltip && activeSector && activeSector.sweep > 0 && (
        <div ref={tooltipRef} className={styles.tooltip}>
          <DataTooltip
            active
            payload={[
              {
                name: activeSector.row[nameKey],
                value: activeSector.row[dataKey],
                color: activeSector.color,
                dataKey,
                payload: activeSector.row,
              },
            ]}
            date={date}
            variant={variant}
            formatValue={formatValue}
          />
        </div>
      )}
    </div>
  );
}
