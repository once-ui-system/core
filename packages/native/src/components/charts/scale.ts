import type { BarWidth, CurveType, DataPoint, DateConfig, SeriesConfig } from "./interfaces";

/** Core's `schemes`, the order `getDistributedColor` picks from. */
export const SCHEMES = [
  "blue",
  "indigo",
  "violet",
  "magenta",
  "pink",
  "red",
  "orange",
  "yellow",
  "moss",
  "green",
  "emerald",
  "aqua",
  "cyan",
];

/** Core's `getDistributedColor`: maximally distinct schemes for a series without a colour. */
export function getDistributedColor(index: number, totalItems?: number): string {
  const total = SCHEMES.length;
  if (totalItems === 2) return SCHEMES[[0, 6][index % 2]];
  if (totalItems === 3) return SCHEMES[[0, 6, 12][index % 3]];
  if (totalItems === 4) return SCHEMES[[0, 6, 9, 3][index % 4]];
  if (totalItems && totalItems > 1) {
    const step = Math.max(1, Math.floor(total / totalItems));
    const offset = Math.floor(total / (2 * totalItems));
    return SCHEMES[(index * step + offset) % total];
  }
  return SCHEMES[Math.floor(((index * 0.618033988749895) % 1) * total)];
}

/**
 * The x key and the series to draw, as core's charts pick them: the x key is
 * the first key of the first row that is not a series; without `series`, every
 * other key holding numbers is one, coloured by `getDistributedColor`.
 */
export function resolveSeries(
  data: DataPoint[],
  series: SeriesConfig | SeriesConfig[] | undefined,
): { xKey: string; series: Required<SeriesConfig>[] } {
  const list = Array.isArray(series) ? series : series ? [series] : [];
  const keys = list.map((s) => s.key);
  const first = data[0] ?? {};
  const xKey = Object.keys(first).find((key) => !keys.includes(key)) ?? "name";
  const picked: SeriesConfig[] =
    list.length > 0
      ? list
      : Object.keys(first)
          .filter((key) => key !== xKey && key !== "label" && typeof first[key] === "number")
          .map((key) => ({ key }));
  return {
    xKey,
    series: picked.map((s, i) => ({
      key: s.key,
      color: s.color ?? getDistributedColor(i, picked.length),
    })),
  };
}

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A `Date` or ISO string as a date; date-only strings in local time, as date-fns' `parseISO`. */
export function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  const day = value.match(ISO_DAY);
  const date = day ? new Date(+day[1], +day[2] - 1, +day[3]) : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** The rows inside `date.start`…`date.end`, as core filters them; rows without a date stay. */
export function filterByDate(data: DataPoint[], xKey: string, date?: DateConfig): DataPoint[] {
  const { start, end } = date ?? {};
  if (!start || !end) return data;
  return data.filter((row) => {
    const at = toDate(row[xKey]);
    return !at || (at >= start && at <= end);
  });
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (n: number) => String(n).padStart(2, "0");

/** The date-fns tokens core's examples use, without date-fns. */
export function formatDate(date: Date, format: string): string {
  return format.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE|HH|mm/g, (token) => {
    switch (token) {
      case "yyyy":
        return String(date.getFullYear());
      case "yy":
        return pad(date.getFullYear() % 100);
      case "MMMM":
        return MONTHS[date.getMonth()];
      case "MMM":
        return MONTHS[date.getMonth()].slice(0, 3);
      case "MM":
        return pad(date.getMonth() + 1);
      case "M":
        return String(date.getMonth() + 1);
      case "dd":
        return pad(date.getDate());
      case "d":
        return String(date.getDate());
      case "EEEE":
        return DAYS[date.getDay()];
      case "EEE":
        return DAYS[date.getDay()].slice(0, 3);
      case "HH":
        return pad(date.getHours());
      default:
        return pad(date.getMinutes());
    }
  });
}

/**
 * A row's x label, as core's `formatDate`: its `label`, else the x value,
 * written with `date.format` when it is a date (`MMM d` for a `Date` without one).
 */
export function formatLabel(row: DataPoint, xKey: string, date?: DateConfig): string {
  if (row.label) return row.label;
  const value = row[xKey];
  const at = toDate(value);
  if (at && (date?.format || value instanceof Date)) return formatDate(at, date?.format ?? "MMM d");
  return value === undefined ? "" : String(value);
}

/** A number with `,` thousands, as core's tooltip writes it. */
export function formatNumber(value: number): string {
  const [int, frac] = String(value).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

function niceStep(raw: number): number {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow;
}

/**
 * Round tick values covering `min`…`max`, about `count` of them, from zero
 * like recharts' `[0, "auto"]` domain. The first and last are the domain.
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  let lo = Math.min(0, min);
  let hi = Math.max(0, max);
  if (lo === hi) hi = lo + 1;
  const step = niceStep((hi - lo) / Math.max(1, count - 1));
  lo = Math.floor(lo / step) * step;
  hi = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** A linear map from `domain` to `range`. */
export function linearScale(
  [d0, d1]: [number, number],
  [r0, r1]: [number, number],
): (value: number) => number {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (value) => r0 + (value - d0) * k;
}

/** The smallest and largest number the series hold across the rows. */
export function extent(data: DataPoint[], keys: string[]): [number, number] {
  let min = 0;
  let max = 0;
  for (const row of data) {
    for (const key of keys) {
      const v = row[key];
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
  }
  return [min, max];
}

/** Core's `barWidth` sizes, in points. `fill` takes the whole slot. */
export function barSize(width: BarWidth, slot: number): number {
  const sizes = { xs: 12, s: 16, m: 24, l: 40, xl: 64 } as const;
  const px = width === "fill" ? slot : typeof width === "number" ? width : sizes[width];
  return Math.max(1, Math.min(px, slot));
}

/** About how wide `text` sets at `fontSize`, for laying out axis labels before they render. */
export function textWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.6;
}

type Point = [number, number];

const f = (n: number) => Number(n.toFixed(2));
const at = ([x, y]: Point) => `${f(x)},${f(y)}`;

function naturalControls(values: number[]): [number[], number[]] {
  const n = values.length - 1;
  const a = new Array<number>(n);
  const b = new Array<number>(n);
  const r = new Array<number>(n);
  a[0] = 0;
  b[0] = 2;
  r[0] = values[0] + 2 * values[1];
  for (let i = 1; i < n - 1; i++) {
    a[i] = 1;
    b[i] = 4;
    r[i] = 4 * values[i] + 2 * values[i + 1];
  }
  a[n - 1] = 2;
  b[n - 1] = 7;
  r[n - 1] = 8 * values[n - 1] + values[n];
  for (let i = 1; i < n; i++) {
    const m = a[i] / b[i - 1];
    b[i] -= m;
    r[i] -= m * r[i - 1];
  }
  a[n - 1] = r[n - 1] / b[n - 1];
  for (let i = n - 2; i >= 0; i--) a[i] = (r[i] - a[i + 1]) / b[i];
  b[n - 1] = (values[n] + a[n - 1]) / 2;
  for (let i = 0; i < n - 1; i++) b[i] = 2 * values[i + 1] - a[i + 1];
  return [a, b];
}

function monotoneTangents(points: Point[]): number[] {
  const n = points.length;
  const slopes = points.slice(1).map(([x, y], i) => (y - points[i][1]) / (x - points[i][0] || 1));
  const t = new Array<number>(n);
  for (let i = 1; i < n - 1; i++) {
    const [s0, s1] = [slopes[i - 1], slopes[i]];
    const [h0, h1] = [points[i][0] - points[i - 1][0], points[i + 1][0] - points[i][0]];
    const p = (s0 * h1 + s1 * h0) / (h0 + h1);
    t[i] =
      (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
  }
  // d3's ends: the one-sided three-point estimate.
  t[0] = n > 2 ? (3 * slopes[0] - t[1]) / 2 : slopes[0];
  t[n - 1] = n > 2 ? (3 * slopes[n - 2] - t[n - 2]) / 2 : slopes[0];
  return t;
}

/** An SVG path through `points` (left to right), interpolated as d3's curve of that name. */
export function curvePath(points: Point[], curve: CurveType = "linear"): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${at(points[0])}`;
  let d = `M${at(points[0])}`;
  const kind = curve.replace(/(Closed|Open|X|Y)$/, "");
  if (kind === "natural" && points.length > 2) {
    const [ax, bx] = naturalControls(points.map((p) => p[0]));
    const [ay, by] = naturalControls(points.map((p) => p[1]));
    for (let i = 1; i < points.length; i++) {
      d += `C${at([ax[i - 1], ay[i - 1]])} ${at([bx[i - 1], by[i - 1]])} ${at(points[i])}`;
    }
    return d;
  }
  if (kind === "monotone") {
    const t = monotoneTangents(points);
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const dx = (x1 - x0) / 3;
      d += `C${at([x0 + dx, y0 + dx * t[i - 1]])} ${at([x1 - dx, y1 - dx * t[i]])} ${at([x1, y1])}`;
    }
    return d;
  }
  if (kind === "bump") {
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const mx = (x0 + x1) / 2;
      d += `C${at([mx, y0])} ${at([mx, y1])} ${at([x1, y1])}`;
    }
    return d;
  }
  if (kind === "basis" && points.length > 2) {
    // d3's uniform B-spline, clamped to the end points.
    const [p0, p1] = points;
    d += `L${at([(5 * p0[0] + p1[0]) / 6, (5 * p0[1] + p1[1]) / 6])}`;
    const bezier = (a: Point, b: Point, c: Point) =>
      `C${at([(2 * a[0] + b[0]) / 3, (2 * a[1] + b[1]) / 3])} ${at([(a[0] + 2 * b[0]) / 3, (a[1] + 2 * b[1]) / 3])} ${at([(a[0] + 4 * b[0] + c[0]) / 6, (a[1] + 4 * b[1] + c[1]) / 6])}`;
    for (let i = 2; i < points.length; i++) d += bezier(points[i - 2], points[i - 1], points[i]);
    const [a, b] = points.slice(-2);
    return `${d}${bezier(a, b, b)}L${at(b)}`;
  }
  for (let i = 1; i < points.length; i++) {
    const [x0] = points[i - 1];
    const [x1, y1] = points[i];
    if (kind === "step") d += `H${f((x0 + x1) / 2)}V${f(y1)}H${f(x1)}`;
    else if (kind === "stepBefore") d += `V${f(y1)}H${f(x1)}`;
    else if (kind === "stepAfter") d += `H${f(x1)}V${f(y1)}`;
    else d += `L${at([x1, y1])}`;
  }
  return d;
}

/** A value as a screen reader hears it in a row's label. */
export function describeValue(value: unknown): string {
  return typeof value === "number"
    ? formatNumber(value)
    : value === undefined
      ? "–"
      : String(value);
}
