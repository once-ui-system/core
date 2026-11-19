import { type ComponentPropsWithoutRef, type CSSProperties, type ReactNode, useId } from "react";
import { cssColor } from "../../internal/cssColor.js";
import type { ColorValue } from "../../types.js";
import type { SeriesKey, ValueFormat } from "./interfaces.js";
import { makeValueFormatter } from "./utils/chartSeries.js";

/** How a Sparkline joins its points. */
type SparklineCurve = "linear" | "natural" | "monotone" | "step";

/** Sparkline's own props. `T` is the row type when `data` is objects. */
interface SparklineOwnProps<T extends object> {
  /** The values, oldest first: numbers, or rows read by `valueKey`. */
  data: readonly number[] | readonly T[];
  /** The row key to plot when `data` is objects. Defaults to the first key holding a number. */
  valueKey?: SeriesKey<T>;
  /** A line, a line with a filled area under it, or one bar per value. */
  variant?: "line" | "area" | "bar";
  /** A chart colour (`"blue"`, `"emerald"`), a token or any CSS colour. */
  color?: ColorValue;
  /** A number is px; any CSS length passes through. Fills its container's width by default. */
  width?: number | string;
  /** A number is px; any CSS length passes through. */
  height?: number | string;
  /** How the line joins its points. Ignored by bars. */
  curve?: SparklineCurve;
  /** Mark the last value: a dot on a line, the full colour on the last bar. */
  showLast?: boolean;
  /** The value at the bottom edge. Defaults to the lowest value (0 or lower for bars). */
  min?: number;
  /** The value at the top edge. Defaults to the highest value (0 or higher for bars). */
  max?: number;
  /** How values are written in the summary screen readers hear. */
  valueFormat?: ValueFormat;
  /** The BCP 47 locale the summary's numbers are written in. Defaults to `"en-US"`. */
  locale?: string;
  /**
   * What a screen reader hears. Without it, a summary of the data:
   * `"Trend from 120 to 340, high 360"`.
   */
  "aria-label"?: string;
}

type SparklineProps<T extends object = Record<string, number>> = SparklineOwnProps<T> &
  Omit<ComponentPropsWithoutRef<"span">, keyof SparklineOwnProps<T> | "children" | "role">;

/** The viewBox is 100 by 100; `preserveAspectRatio="none"` stretches it to the box. */
const SIZE = 100;

type Point = [number, number];

const n2 = (v: number) => Math.round(v * 100) / 100;

const length = (value: number | string) => (typeof value === "number" ? `${value}px` : value);

function valuesOf<T extends object>(data: SparklineProps<T>["data"], valueKey?: string): number[] {
  const out: number[] = [];
  for (const item of data ?? []) {
    let value: unknown = item;
    if (typeof item === "object" && item !== null) {
      const row = item as Record<string, unknown>;
      const key = valueKey ?? Object.keys(row).find((k) => typeof row[k] === "number");
      value = key === undefined ? undefined : row[key];
    }
    if (typeof value === "number" && Number.isFinite(value)) out.push(value);
  }
  return out;
}

function linear(points: Point[]) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${n2(x)},${n2(y)}`).join("");
}

/** d3's `curveStep`: the change happens halfway between two points. */
function step(points: Point[]) {
  let d = `M${n2(points[0][0])},${n2(points[0][1])}`;
  for (let i = 1; i < points.length; i++) {
    const mid = (points[i - 1][0] + points[i][0]) / 2;
    d += `H${n2(mid)}V${n2(points[i][1])}H${n2(points[i][0])}`;
  }
  return d;
}

/** d3's `curveMonotoneX`: smooth, and never overshoots a point. */
function monotone(points: Point[]) {
  const n = points.length;
  if (n < 3) return linear(points);
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = points[i + 1][0] - points[i][0];
    slopes.push(h ? (points[i + 1][1] - points[i][1]) / h : 0);
  }
  const t: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const s0 = slopes[i - 1];
    const s1 = slopes[i];
    const h0 = points[i][0] - points[i - 1][0];
    const h1 = points[i + 1][0] - points[i][0];
    const p = (s0 * h1 + s1 * h0) / (h0 + h1);
    t[i] =
      (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
  }
  t[0] = (3 * slopes[0] - t[1]) / 2;
  t[n - 1] = (3 * slopes[n - 2] - t[n - 2]) / 2;
  let d = `M${n2(points[0][0])},${n2(points[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const dx = (x1 - x0) / 3;
    d += `C${n2(x0 + dx)},${n2(y0 + dx * t[i])} ${n2(x1 - dx)},${n2(y1 - dx * t[i + 1])} ${n2(x1)},${n2(y1)}`;
  }
  return d;
}

/** d3's `curveNatural` control points for one coordinate. */
function controlPoints(x: number[]): [number[], number[]] {
  const n = x.length - 1;
  const a = new Array<number>(n);
  const b = new Array<number>(n);
  const r = new Array<number>(n);
  a[0] = 0;
  b[0] = 2;
  r[0] = x[0] + 2 * x[1];
  for (let i = 1; i < n - 1; i++) {
    a[i] = 1;
    b[i] = 4;
    r[i] = 4 * x[i] + 2 * x[i + 1];
  }
  a[n - 1] = 2;
  b[n - 1] = 7;
  r[n - 1] = 8 * x[n - 1] + x[n];
  for (let i = 1; i < n; i++) {
    const m = a[i] / b[i - 1];
    b[i] -= m;
    r[i] -= m * r[i - 1];
  }
  a[n - 1] = r[n - 1] / b[n - 1];
  for (let i = n - 2; i >= 0; i--) a[i] = (r[i] - a[i + 1]) / b[i];
  b[n - 1] = (x[n] + a[n - 1]) / 2;
  for (let i = 0; i < n - 1; i++) b[i] = 2 * x[i + 1] - a[i + 1];
  return [a, b];
}

/** d3's `curveNatural`: the natural cubic spline the charts draw by default. */
function natural(points: Point[]) {
  if (points.length < 3) return linear(points);
  const [ax, bx] = controlPoints(points.map((p) => p[0]));
  const [ay, by] = controlPoints(points.map((p) => p[1]));
  let d = `M${n2(points[0][0])},${n2(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    d += `C${n2(ax[i])},${n2(ay[i])} ${n2(bx[i])},${n2(by[i])} ${n2(points[i + 1][0])},${n2(points[i + 1][1])}`;
  }
  return d;
}

const CURVES: Record<SparklineCurve, (points: Point[]) => string> = {
  linear,
  natural,
  monotone,
  step,
};

/**
 * The summary a Sparkline is read as when no `aria-label` is given: where the
 * values start and end, the highest, and the lowest when it is below both
 * ends. `"Trend from 120 to 340, high 360"`.
 */
function sparklineSummary(values: number[], write: (value: number) => string): string {
  if (values.length === 0) return "No data";
  if (values.length === 1) return `Value ${write(values[0])}`;
  const first = values[0];
  const last = values[values.length - 1];
  const high = Math.max(...values);
  const low = Math.min(...values);
  let text = `Trend from ${write(first)} to ${write(last)}, high ${write(high)}`;
  if (low < Math.min(first, last)) text += `, low ${write(low)}`;
  return text;
}

/**
 * A tiny trend line for a stat tile or a table cell: no axes, no legend, no
 * card. Pure SVG, so it renders on the server. The drawing stretches to its
 * box (`preserveAspectRatio="none"`) while the line keeps its width, and it
 * is one image to a screen reader, named by a summary of the values.
 *
 * ```tsx
 * <Sparkline data={[120, 180, 160, 240, 360, 340]} variant="area" showLast />
 * ```
 */
const Sparkline = <T extends object = Record<string, number>>({
  data,
  valueKey,
  variant = "line",
  color = "blue",
  width = "100%",
  height = 32,
  curve = "monotone",
  showLast = false,
  min,
  max,
  valueFormat,
  locale,
  "aria-label": ariaLabel,
  style,
  ...rest
}: SparklineProps<T>) => {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const values = valuesOf(data, valueKey);
  const paint = cssColor(String(color), "data-");
  const label = ariaLabel ?? sparklineSummary(values, makeValueFormatter(valueFormat, locale));

  const bars = variant === "bar";
  const dataLow = values.length ? Math.min(...values) : 0;
  const dataHigh = values.length ? Math.max(...values) : 0;
  const low = min ?? (bars ? Math.min(0, dataLow) : dataLow);
  const high = max ?? (bars ? Math.max(0, dataHigh) : dataHigh);
  const span = high - low;
  const y = (v: number) => (span ? SIZE - ((v - low) / span) * SIZE : SIZE / 2);

  const points: Point[] =
    values.length === 1
      ? [
          [0, y(values[0])],
          [SIZE, y(values[0])],
        ]
      : values.map((v, i) => [(i / (values.length - 1)) * SIZE, y(v)]);
  const last = points[points.length - 1];

  let drawing: ReactNode = null;
  if (values.length > 0 && bars) {
    const band = SIZE / values.length;
    const base = Math.min(SIZE, Math.max(0, y(Math.min(Math.max(0, low), high))));
    drawing = values.map((v, i) => {
      const top = Math.min(y(v), base);
      return (
        <rect
          // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional
          key={i}
          x={n2(i * band + band * 0.15)}
          width={n2(band * 0.7)}
          y={n2(top)}
          height={n2(Math.max(Math.abs(y(v) - base), 0.5))}
          fill={paint}
          fillOpacity={showLast && i !== values.length - 1 ? 0.4 : 1}
        />
      );
    });
  } else if (values.length > 0) {
    const line = CURVES[curve]?.(points) ?? linear(points);
    drawing = (
      <>
        {variant === "area" && (
          <>
            <defs>
              <linearGradient id={`sparkline-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: paint, stopOpacity: 0.32 }} />
                <stop offset="100%" style={{ stopColor: paint, stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path d={`${line}L${SIZE},${SIZE}L0,${SIZE}Z`} fill={`url(#sparkline-${id})`} />
          </>
        )}
        <path
          d={line}
          fill="none"
          stroke={paint}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </>
    );
  }

  const box: CSSProperties = {
    display: "inline-block",
    position: "relative",
    verticalAlign: "middle",
    width: length(width),
    height: length(height),
    ...style,
  };

  return (
    <span role="img" aria-label={label} style={box} {...rest}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        {drawing}
      </svg>
      {showLast && !bars && last && (
        // A dot in the stretched viewBox would be an ellipse, so it is drawn
        // over the SVG at the last point instead.
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${n2(last[0])}%`,
            top: `${n2(last[1])}%`,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: paint,
            boxShadow: "0 0 0 2px var(--page-background)",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </span>
  );
};

Sparkline.displayName = "Sparkline";

export type { SparklineCurve, SparklineProps };
export { Sparkline };
