"use client";

import type React from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDataTheme } from "../../contexts/DataThemeProvider.js";
import styles from "./Chart.module.css";
import { DataTooltip } from "./DataTooltip.js";
import { LinearGradient } from "./Gradient.js";
import type { ChartProps, ChartVariant, CurveType, DataPoint, DateConfig } from "./interfaces.js";
import { Legend } from "./Legend.js";
import { rowsByX } from "./utils/chartSeries.js";
import { formatDate } from "./utils/formatDate.js";
import {
  areaPath,
  barSlots,
  curvePath,
  extent,
  fixedTicks,
  linearScale,
  niceTicks,
  type Point,
  roundedRect,
  stackSeries,
  textWidth,
  thinTicks,
} from "./utils/scale.js";

/**
 * The size a plot draws at before it is measured: on the server, and in the
 * browser until the first layout. About a chart's plot at the default height
 * in a half-width column; the SVG stretches to its real box until then.
 */
export const DEFAULT_PLOT_SIZE = { width: 640, height: 320 };

/** Measures `ref`'s box, starting from `fallback`, and follows it as it resizes. */
export function usePlotSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState(DEFAULT_PLOT_SIZE);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      // Fractional, as the box really is: rounding moved the scale by a pixel.
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
      }
    };
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

/** The CSS custom properties that time a chart's entry animation. */
export function animationStyle(
  begin?: number,
  duration?: number,
  easing?: unknown,
): React.CSSProperties {
  return {
    ...(begin !== undefined ? { "--chart-delay": `${begin}ms` } : {}),
    ...(duration !== undefined ? { "--chart-duration": `${duration}ms` } : {}),
    ...(typeof easing === "string" ? { "--chart-easing": easing } : {}),
  } as React.CSSProperties;
}

export interface PlotSeries {
  key: string;
  label: string;
  /** A CSS colour. */
  color: string;
  kind: "area" | "bar";
}

type Corners = [number, number, number, number];

export interface CartesianPlotProps {
  /** Scopes the gradient and clip ids. */
  id: string;
  rows: readonly DataPoint[];
  xKey: string;
  series: PlotSeries[];
  variant: ChartVariant;
  axis: NonNullable<ChartProps["axis"]>;
  grid: NonNullable<ChartProps["grid"]>;
  legend: {
    display: boolean;
    position: NonNullable<NonNullable<ChartProps["legend"]>["position"]>;
    direction?: "row" | "column";
  };
  tooltip: boolean;
  date?: DateConfig;
  format: { axis?: (value: number) => string; tooltip?: (value: number, key?: string) => string };
  /** The value axis' width; the category axis' when the bars lie down. */
  axisWidth: number;
  categoryWidth?: number;
  stack?: boolean | "percent";
  horizontal?: boolean;
  reverseX?: boolean;
  reverseY?: boolean;
  curve?: CurveType;
  xType?: "number" | "category";
  xDomain?: [number, number];
  /** Bar thickness in px, or `"fill"` for the band. */
  barSize?: number | "fill";
  barRadius?: (topmost: boolean) => Corners;
  /** The category axis draws its line (the line and composed charts' x axis does). */
  categoryAxisLine?: boolean;
  /** The category x axis' height, and the room between it and its labels. */
  xAxisHeight?: number;
  xTickMargin?: number;
  /** Bar charts shade the hovered band; the others draw a line. */
  cursor?: "line" | "band" | "none";
  /** Category names start at this inset beside horizontal bars. */
  categoryInset?: number;
  animation?: boolean;
  animationStyle?: React.CSSProperties;
  /** The key DataTooltip reads a label from when it has none. */
  tooltipDataKey?: string;
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * The plot of LineChart, BarChart and LineBarChart: axes, grid, areas and
 * bars in one SVG, sized to its box. It draws on the server at
 * `DEFAULT_PLOT_SIZE`, stretched to the box, and at its measured size once
 * the browser has laid it out. Tick labels are HTML placed by percentage, so
 * they stay crisp and line up with the grid either way.
 */
export function CartesianPlot({
  id,
  rows,
  xKey,
  series: allSeries,
  variant,
  axis,
  grid,
  legend,
  tooltip,
  date,
  format,
  axisWidth,
  categoryWidth = 64,
  stack = false,
  horizontal = false,
  reverseX = false,
  reverseY = false,
  curve = "linear",
  xType = "category",
  xDomain,
  barSize = 40,
  barRadius = () => [6, 6, 6, 6],
  categoryAxisLine = true,
  xAxisHeight = 32,
  xTickMargin = 6,
  cursor = "line",
  categoryInset = 20,
  animation = true,
  animationStyle: timing,
  tooltipDataKey,
}: CartesianPlotProps) {
  const {
    tick: { fill: tickFill, fontSize, line: tickLine },
    axis: { stroke: axisStroke },
  } = useDataTheme();
  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { width: W, height: H } = usePlotSize(ref);
  const [hidden, setHidden] = useState<string[]>([]);
  const [active, setActive] = useState<{ index: number; y?: number } | null>(null);

  const series = allSeries.filter((s) => !hidden.includes(s.key));
  const hasBars = allSeries.some((s) => s.kind === "bar");
  const showX = axis === "x" || axis === "both";
  const showY = axis === "y" || axis === "both";
  const catShown = horizontal ? showY : showX;
  const valShown = horizontal ? showX : showY;
  const numericX = !horizontal && xType === "number";
  const rowsAtX = useMemo(() => rowsByX(rows, xKey), [rows, xKey]);
  const label = (value: unknown, row?: DataPoint) =>
    String(formatDate(value, date, row ?? rowsAtX.get(value)) ?? "");

  // The frame: axes take fixed room at the edges, a bottom legend 40px under them.
  const xAxisRoom = horizontal ? (valShown ? 32 : 0) : catShown ? xAxisHeight : 0;
  const yAxisRoom = horizontal ? (catShown ? categoryWidth : 0) : valShown ? axisWidth : 0;
  // A bottom legend keeps its wrapper's height clear: 40px of static space,
  // measured once laid out, as that space scales with the density.
  const legendRef = useRef<HTMLDivElement>(null);
  const [legendRoom, setLegendRoom] = useState(40);
  useLayoutEffect(() => {
    const room = legendRef.current?.getBoundingClientRect().height;
    if (room && room !== legendRoom) setLegendRoom(room);
  });
  const legendBottom = legend.display && legend.position.startsWith("bottom") ? legendRoom : 0;
  const left = reverseY ? 0 : yAxisRoom;
  const top = reverseX ? xAxisRoom : 0;
  const plot = {
    x: left,
    y: top,
    w: Math.max(1, W - yAxisRoom),
    h: Math.max(1, H - xAxisRoom - legendBottom),
  };
  // The top 40px stay clear for the legend, over a shown value axis (or any bars lying down).
  const padTop = horizontal ? (legend.display ? 40 : 0) : valShown ? 40 : 0;

  // Values: stacked bands, or each series from zero.
  const percent = stack === "percent";
  const bands = useMemo(
    () =>
      stack
        ? stackSeries(
            rows,
            series.map((s) => s.key),
            percent,
          )
        : series.map((s) =>
            rows.map((row): [number, number] => [
              0,
              isNum(row[s.key]) ? (row[s.key] as number) : NaN,
            ]),
          ),
    [rows, series, stack, percent],
  );
  const ticks = useMemo(() => {
    if (percent) return niceTicks(0, 1);
    return niceTicks(...extent(bands.flat(2)));
  }, [bands, percent]);
  const domain: [number, number] = [ticks[0], ticks[ticks.length - 1]];
  const valueRange: [number, number] = horizontal
    ? [plot.x, plot.x + plot.w]
    : [plot.y + plot.h, plot.y + padTop];
  const value = linearScale(domain, valueRange);
  const base = value(Math.min(Math.max(0, domain[0]), domain[1]));

  // Categories: bands when there are bars, points otherwise, or a number line.
  const catStart = horizontal ? plot.y + padTop : plot.x;
  const catLength = horizontal ? plot.h - padTop : plot.w;
  const n = rows.length;
  const band = catLength / Math.max(1, n);
  const xValues = numericX ? rows.map((row) => Number(row[xKey])) : [];
  const xTicksNumeric = numericX
    ? xDomain
      ? fixedTicks(xDomain[0], xDomain[1])
      : niceTicks(Math.min(...xValues), Math.max(...xValues))
    : [];
  const xNum = numericX
    ? linearScale(xDomain ?? [xTicksNumeric[0], xTicksNumeric[xTicksNumeric.length - 1]], [
        plot.x,
        plot.x + plot.w,
      ])
    : undefined;
  const at = (i: number) =>
    xNum
      ? xNum(xValues[i])
      : hasBars
        ? catStart + band * (i + 0.5)
        : n > 1
          ? catStart + (i * catLength) / (n - 1)
          : catStart + catLength / 2;
  const centres = rows.map((_, i) => at(i));

  // Bars: a slot per series in each band, or one slot a stack shares.
  const bars = series.filter((s) => s.kind === "bar");
  const slots = barSlots(band, stack ? 1 : bars.length, barSize);

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const tickStyle: React.CSSProperties = { color: tickFill, fontSize };

  // Category labels, thinned to what fits, as recharts' `preserveEnd` does.
  // The grid's vertical lines follow the labels that are kept, as recharts' did.
  const catTicks = (() => {
    if (horizontal)
      return rows.map((row, i) => ({
        index: i,
        at: centres[i],
        line: centres[i],
        text: label(row[xKey], row),
      }));
    const values = numericX ? xTicksNumeric : rows.map((row) => row[xKey]);
    const coords = numericX
      ? xTicksNumeric.map((v) => (xNum as (v: number) => number)(v))
      : centres;
    const texts = values.map((v, i) => label(v, numericX ? undefined : rows[i]));
    return thinTicks(
      coords,
      texts.map((t) => textWidth(t, fontSize)),
      0,
      W,
    ).map((t) => ({ ...t, line: coords[t.index], text: texts[t.index] }));
  })();
  const catLabels = catShown ? catTicks : [];

  const plotBottom = plot.y + plot.h;
  const plotRight = plot.x + plot.w;
  const valueAxisAt = horizontal ? (reverseX ? plot.y : plotBottom) : reverseY ? plotRight : plot.x;
  const catAxisAt = horizontal ? (reverseY ? plotRight : plot.x) : reverseX ? plot.y : plotBottom;

  // Interaction: the row under the pointer, or the one the arrow keys reach.
  const indexAt = (pos: number) => {
    if (n === 0) return null;
    let best = 0;
    for (let i = 1; i < n; i++) {
      if (Math.abs(centres[i] - pos) < Math.abs(centres[best] - pos)) best = i;
    }
    return best;
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!tooltip) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * W;
    const y = ((event.clientY - box.top) / box.height) * H;
    const inside = x >= plot.x && x <= plotRight && y >= plot.y && y <= plotBottom;
    const index = inside ? indexAt(horizontal ? y : x) : null;
    setActive(index === null ? null : { index, y: horizontal ? x : y });
  };
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!tooltip || n === 0) return;
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    const current = active?.index ?? (step > 0 ? -1 : n);
    let next: number | null = null;
    if (step) next = Math.min(n - 1, Math.max(0, current + step));
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = n - 1;
    else if (event.key === "Escape") return setActive(null);
    if (next === null) return;
    event.preventDefault();
    setActive({ index: next });
  };

  const activeRow = active && active.index < n ? rows[active.index] : undefined;

  // Keep the tooltip inside the plot: beside the point, flipped at the edge.
  useLayoutEffect(() => {
    const el = tooltipRef.current;
    const box = ref.current;
    if (!el || !box || !active) return;
    const sx = box.clientWidth / W || 1;
    const sy = box.clientHeight / H || 1;
    const c = centres[active.index] ?? 0;
    const x = (horizontal ? (active.y ?? plot.x + plot.w / 2) : c) * sx;
    const y = (horizontal ? c : (active.y ?? plot.y + padTop)) * sy;
    let left = x + 10;
    if (left + el.offsetWidth > box.clientWidth) left = Math.max(0, x - el.offsetWidth - 10);
    const top = Math.max(0, Math.min(y + 10, box.clientHeight - el.offsetHeight));
    el.style.transform = `translate(${left}px, ${top}px)`;
  });

  const gradient = (i: number) => `barGradient${id}${i}`;
  const areaKeys = series.filter((s) => s.kind === "area");
  const dataSeries = allSeries.map((s, i) => ({ ...s, i }));
  const visible = dataSeries.filter((s) => !hidden.includes(s.key));
  const shift = "translate(0, -1)";
  const topmostBar = bars[bars.length - 1]?.key;

  const areaLayer = visible
    .filter((s) => s.kind === "area")
    .map((s) => {
      const b = bands[series.findIndex((x) => x.key === s.key)];
      // Runs of rows with a value; a missing one breaks the line, as recharts did.
      const runs: number[][] = [[]];
      rows.forEach((row, i) => {
        if (isNum(row[s.key])) runs[runs.length - 1].push(i);
        else if (runs[runs.length - 1].length) runs.push([]);
      });
      let fill = "";
      let line = "";
      for (const run of runs.filter((r) => r.length)) {
        const topPts: Point[] = run.map((i) => [centres[i], value(b[i][1])]);
        const basePts: Point[] = run.map((i) => [centres[i], stack ? value(b[i][0]) : base]);
        fill += areaPath(topPts, basePts, curve);
        line += curvePath(topPts, curve);
      }
      return (
        <g key={s.key} transform={shift}>
          {variant !== "outline" && (
            <path d={fill} fill={`url(#${gradient(s.i)})`} fillOpacity={0.6} stroke="none" />
          )}
          <path d={line} fill="none" stroke={s.color} strokeWidth={1} />
        </g>
      );
    });

  const barLayer = visible
    .filter((s) => s.kind === "bar")
    .map((s) => {
      const b = bands[series.findIndex((x) => x.key === s.key)];
      const slot = slots[stack ? 0 : bars.findIndex((x) => x.key === s.key)];
      const corners = barRadius(!stack || s.key === topmostBar);
      return (
        <g key={s.key} transform={shift}>
          {rows.map((_, i) => {
            const [v0, v1] = b[i];
            if (!isNum(v1) || v0 === v1 || !slot) return null;
            const a = value(v0);
            const z = value(v1);
            const from = catStart + band * i + slot.offset;
            const d = horizontal
              ? roundedRect(Math.min(a, z), from, Math.abs(z - a), slot.size, corners)
              : roundedRect(from, Math.min(a, z), slot.size, Math.abs(z - a), corners);
            return (
              <path
                // biome-ignore lint/suspicious/noArrayIndexKey: a bar's place is its row.
                key={i}
                d={d}
                fill={`url(#${gradient(s.i)})`}
                stroke={s.color}
                strokeWidth={1}
              />
            );
          })}
        </g>
      );
    });

  const valueTickAt = (t: number) => value(t);
  const gridH = horizontal ? centres : ticks.map(valueTickAt);
  const gridV = horizontal ? ticks.map(valueTickAt) : catTicks.map((t) => t.line);
  const valueLabel = (t: number) => (format.axis ? format.axis(t) : String(t));

  const activeAt = activeRow ? centres[active?.index ?? 0] : undefined;
  const legendTop = legend.position.startsWith("top");
  const legendCenter = legend.position.endsWith("center");

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the arrow keys move the tooltip between rows.
    <div
      ref={ref}
      className={styles.plot}
      tabIndex={tooltip && n > 0 ? 0 : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setActive(null)}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {dataSeries.map((s) => (
            <LinearGradient key={s.key} id={gradient(s.i)} variant={variant} color={s.color} />
          ))}
          <clipPath id={`plot${id}`}>
            <rect x={plot.x - 1} y={plot.y - 2} width={plot.w + 2} height={plot.h + 3} />
          </clipPath>
        </defs>
        <g stroke="var(--neutral-alpha-weak)">
          {(grid === "y" || grid === "both") &&
            gridH.map((y, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: grid lines have no id but their place.
              <line key={`h${i}`} x1={plot.x} x2={plotRight} y1={y} y2={y} />
            ))}
          {(grid === "x" || grid === "both") &&
            gridV.map((x, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: grid lines have no id but their place.
              <line key={`v${i}`} x1={x} x2={x} y1={plot.y} y2={plotBottom} />
            ))}
        </g>
        {areaLayer.length > 0 && (
          <g clipPath={`url(#plot${id})`}>
            <g className={animation ? styles.reveal : undefined} style={timing}>
              {areaLayer}
            </g>
          </g>
        )}
        {activeAt !== undefined && cursor === "band" && (
          <rect
            x={horizontal ? plot.x : catStart + band * (active?.index ?? 0)}
            y={horizontal ? catStart + band * (active?.index ?? 0) : plot.y}
            width={horizontal ? plot.w : band}
            height={horizontal ? band : plot.h}
            fill="var(--neutral-alpha-weak)"
          />
        )}
        {barLayer.length > 0 && (
          <g clipPath={`url(#plot${id})`}>
            <g
              className={animation ? (horizontal ? styles.growX : styles.grow) : undefined}
              style={{ "--chart-duration": "400ms", ...timing } as React.CSSProperties}
            >
              {barLayer}
            </g>
          </g>
        )}
        <g stroke={axisStroke} fill="none">
          {valShown &&
            (horizontal ? (
              <line x1={plot.x} x2={plotRight} y1={valueAxisAt} y2={valueAxisAt} />
            ) : (
              <line x1={valueAxisAt} x2={valueAxisAt} y1={plot.y} y2={plotBottom} />
            ))}
          {catShown && categoryAxisLine && !horizontal && (
            <line x1={plot.x} x2={plotRight} y1={catAxisAt} y2={catAxisAt} />
          )}
          {tickLine &&
            valShown &&
            ticks.map((t) => {
              const p = value(t);
              const o = horizontal ? (reverseX ? -6 : 6) : reverseY ? 6 : -6;
              return horizontal ? (
                <line key={t} x1={p} x2={p} y1={valueAxisAt} y2={valueAxisAt + o} />
              ) : (
                <line key={t} x1={valueAxisAt} x2={valueAxisAt + o} y1={p} y2={p} />
              );
            })}
        </g>
        {activeAt !== undefined && cursor === "line" && (
          <line
            x1={activeAt}
            x2={activeAt}
            y1={plot.y}
            y2={plotBottom}
            stroke="var(--neutral-border-strong)"
            strokeWidth={1}
          />
        )}
        {activeRow &&
          cursor === "line" &&
          areaKeys.map((s) => {
            const b = bands[series.indexOf(s)];
            const v = b?.[active?.index ?? 0]?.[1];
            if (!isNum(v)) return null;
            return (
              <circle
                key={s.key}
                cx={activeAt}
                cy={value(v) - 1}
                r={4}
                fill={s.color}
                stroke="var(--background)"
                strokeWidth={0}
              />
            );
          })}
      </svg>
      {valShown &&
        ticks.map((t) => {
          const p = value(t);
          const style: React.CSSProperties = horizontal
            ? {
                left: pct(p, W),
                transform: "translateX(-50%)",
                top: reverseX ? undefined : pct(valueAxisAt + 6 + 2 - 1, H),
                bottom: reverseX ? pct(H - (valueAxisAt - 8), H) : undefined,
              }
            : {
                top: pct(p, H),
                transform: "translateY(-50%)",
                ...(reverseY
                  ? { left: pct(valueAxisAt + 8, W) }
                  : { right: pct(W - (valueAxisAt - 8), W) }),
              };
          return (
            <span key={t} className={styles.tick} style={{ ...tickStyle, ...style }}>
              {valueLabel(t)}
            </span>
          );
        })}
      {catLabels.map(({ index, at: c, text }) => {
        const style: React.CSSProperties = horizontal
          ? {
              top: pct(c, H),
              transform: "translateY(-50%)",
              ...(reverseY ? { left: pct(catAxisAt + 8, W) } : { left: categoryInset }),
            }
          : {
              left: pct(c, W),
              transform: "translateX(-50%)",
              ...(reverseX
                ? { bottom: pct(H - (catAxisAt - 6 - xTickMargin), H) }
                : { top: pct(catAxisAt + 6 + xTickMargin - 1, H) }),
            };
        return (
          <span key={index} className={styles.tick} style={{ ...tickStyle, ...style }}>
            {text}
          </span>
        );
      })}
      {legend.display && (
        <div
          ref={legendRef}
          style={{
            position: "absolute",
            top: legendTop ? (reverseX ? 32 : 0) : undefined,
            bottom: legendTop ? undefined : 0,
            paddingBottom: legendTop ? undefined : "var(--static-space-40)",
            left: showY && legendCenter ? "var(--static-space-64)" : 0,
            right: 0,
          }}
        >
          <Legend
            axisWidth={horizontal ? categoryWidth : axisWidth}
            payload={allSeries.map((s) => ({ value: s.label, color: s.color }))}
            reverseY={reverseY}
            labels={axis}
            position={legend.position}
            direction={legend.direction}
            variant={variant}
            hidden={allSeries.map((s) => hidden.includes(s.key))}
            onToggle={
              allSeries.length > 1
                ? (i) => {
                    const key = allSeries[i].key;
                    setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : [...h, key]));
                  }
                : undefined
            }
          />
        </div>
      )}
      {tooltip && activeRow && (
        <div ref={tooltipRef} className={styles.tooltip}>
          <DataTooltip
            active
            label={activeRow[xKey] as string | number}
            payload={series.map((s) => ({
              name: s.label,
              value: activeRow[s.key],
              color: s.color,
              dataKey: s.key,
              payload: activeRow,
            }))}
            variant={variant}
            date={date}
            dataKey={tooltipDataKey}
            formatValue={format.tooltip}
          />
        </div>
      )}
    </div>
  );
}
