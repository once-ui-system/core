/**
 * The pure math behind the SVG charts: value ticks, scales, stacks, bar slots,
 * tick thinning and curves. No React and no DOM, so it runs the same on the
 * server and in the browser.
 *
 * The curve math is copied from the phone package's
 * `packages/native/src/components/charts/scale.ts` (the two packages share no
 * runtime code); keep the two in step. The tick, bar slot and thinning rules
 * follow recharts 3, which drew these charts until 3.0, so the axes read the
 * same as before.
 */
import type { CurveType } from "../interfaces.js";

export type Point = [number, number];

/** Rounds away float noise (`0.30000000000000004`). */
const clean = (n: number) => Number(n.toPrecision(12));

function stepFor(rough: number, correction: number): number {
  if (rough <= 0) return 0;
  const digits = Math.floor(Math.log10(rough)) + 1;
  const magnitude = 10 ** digits;
  const unit = digits !== 1 ? 0.05 : 0.1;
  return clean((Math.ceil(clean(rough / magnitude / unit)) + correction) * unit * magnitude);
}

/**
 * Round ticks covering `min`…`max`: recharts' `getNiceTickValues`, so a value
 * axis reads `0 45 90 135 180` as it did. Zero is a tick whenever the range
 * holds it. The first and last ticks are the axis' domain.
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min > max) [min, max] = [max, min];
  if (min === max) {
    const middle = min === 0 ? Math.floor((count - 1) / 2) : Math.floor(min);
    const offset = Math.floor((count - 1) / 2);
    return Array.from({ length: count }, (_, i) => middle + i - offset);
  }
  let correction = 0;
  for (;;) {
    const step = stepFor((max - min) / (count - 1), correction);
    const middle = min <= 0 && max >= 0 ? 0 : clean((min + max) / 2 - (((min + max) / 2) % step));
    let below = Math.ceil(clean((middle - min) / step));
    let above = Math.ceil(clean((max - middle) / step));
    const total = below + above + 1;
    if (total > count) {
      correction++;
      continue;
    }
    if (total < count) {
      if (max > 0) above += count - total;
      else below += count - total;
    }
    return Array.from({ length: below + above + 1 }, (_, i) => clean(middle + (i - below) * step));
  }
}

/**
 * Ticks for a domain the caller fixed (`xDomain`): round steps from `min`,
 * ending on `max` itself, as recharts writes them (`5 8 11 14 15`).
 */
export function fixedTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const step = stepFor((max - min) / (count - 1), 0);
  const ticks: number[] = [];
  for (let v = min; v < max - step * 1e-9 && ticks.length < 1000; v = clean(v + step)) {
    ticks.push(v);
  }
  return [...ticks, max];
}

/** A linear map from `domain` to `range`. */
export function linearScale(
  [d0, d1]: [number, number],
  [r0, r1]: [number, number],
): (value: number) => number {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (value) => r0 + (value - d0) * k;
}

/** One series' slice of a stack at each row: from `[i][0]` to `[i][1]`. */
export type StackBand = [number, number][];

/**
 * Stacks the series row by row, in order: each starts where the one before
 * ended. `"percent"` scales each row to 0…1, its share of the row's total.
 * A missing value adds nothing.
 */
export function stackSeries(
  rows: readonly Record<string, unknown>[],
  keys: string[],
  percent = false,
): StackBand[] {
  const bands: StackBand[] = keys.map(() => []);
  rows.forEach((row, i) => {
    const values = keys.map((key) => {
      const v = row[key];
      return typeof v === "number" && Number.isFinite(v) ? v : 0;
    });
    const total = values.reduce((sum, v) => sum + v, 0);
    let base = 0;
    values.forEach((v, s) => {
      const share = percent ? (total ? v / total : 0) : v;
      bands[s][i] = [base, base + share];
      base += share;
    });
  });
  return bands;
}

/** The smallest and largest number in `bands` (or the rows' values), always holding 0. */
export function extent(values: Iterable<number>): [number, number] {
  let min = 0;
  let max = 0;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
}

/** Where each bar sits in its category's band: recharts' `getBarPositions`. */
export function barSlots(
  band: number,
  count: number,
  size: number | "fill",
  gap = 4,
): { offset: number; size: number }[] {
  if (count < 1) return [];
  let sum = size === "fill" ? band * count : size * count;
  let realGap = gap;
  sum += (count - 1) * gap;
  if (sum >= band) {
    sum -= (count - 1) * gap;
    realGap = 0;
  }
  let each = size === "fill" ? band : size;
  if (sum >= band && band > 0) {
    each = (band / count) * 0.9;
    sum = count * each;
  }
  const offset = Math.round((band - sum) / 2);
  return Array.from({ length: count }, (_, i) => ({
    offset: offset + i * (each + realGap),
    size: each,
  }));
}

/** About how wide `text` sets at `fontSize`: tick thinning needs it before anything renders. */
export function textWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) {
    em += /[\d]/.test(ch)
      ? 0.58
      : /[ijl.,:;'|!\s]/.test(ch)
        ? 0.3
        : /[mwMW@%]/.test(ch)
          ? 0.88
          : /[A-Z]/.test(ch)
            ? 0.68
            : 0.54;
  }
  return em * fontSize;
}

/**
 * The ticks a horizontal axis has room for, from the end backwards, as
 * recharts' `preserveEnd` picks them: the last label is pulled inside the
 * chart, and a label that would overlap the one after it, or hang past the
 * chart's edge, is left out. Returns each kept tick's index and label centre.
 */
export function thinTicks(
  coords: number[],
  widths: number[],
  start: number,
  end: number,
  gap = 5,
): { index: number; at: number }[] {
  const kept: { index: number; at: number }[] = [];
  let limit = end;
  for (let i = coords.length - 1; i >= 0; i--) {
    const half = widths[i] / 2;
    let at = coords[i];
    if (i === coords.length - 1 && at + half > limit) at = limit - half;
    if (at < start || at > limit) continue;
    if (at - half >= start && at + half <= limit) {
      kept.unshift({ index: i, at });
      limit = at - half - gap;
    }
  }
  return kept;
}

/** A rectangle with each corner rounded on its own: `[topLeft, topRight, bottomRight, bottomLeft]`. */
export function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  [tl, tr, br, bl]: [number, number, number, number],
): string {
  const max = Math.min(w / 2, h / 2);
  const [a, b, c, d] = [tl, tr, br, bl].map((r) => Math.max(0, Math.min(r, max)));
  return (
    `M${f(x + a)},${f(y)}H${f(x + w - b)}${b ? `A${f(b)},${f(b)} 0 0 1 ${f(x + w)},${f(y + b)}` : ""}` +
    `V${f(y + h - c)}${c ? `A${f(c)},${f(c)} 0 0 1 ${f(x + w - c)},${f(y + h)}` : ""}` +
    `H${f(x + d)}${d ? `A${f(d)},${f(d)} 0 0 1 ${f(x)},${f(y + h - d)}` : ""}` +
    `V${f(y + a)}${a ? `A${f(a)},${f(a)} 0 0 1 ${f(x + a)},${f(y)}` : ""}Z`
  );
}

/**
 * A ring or pie slice around `cx`,`cy`, from `start` to `end` degrees,
 * counter-clockwise from three o'clock as recharts drew them.
 */
export function sectorPath(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  start: number,
  end: number,
): string {
  const sweep = Math.min(359.999, end - start);
  const at = (r: number, deg: number) => {
    const rad = (-deg * Math.PI) / 180;
    return `${f(cx + r * Math.cos(rad))},${f(cy + r * Math.sin(rad))}`;
  };
  const large = sweep > 180 ? 1 : 0;
  const stop = start + sweep;
  let d = `M${at(outer, start)}A${f(outer)},${f(outer)} 0 ${large} 0 ${at(outer, stop)}`;
  d +=
    inner > 0
      ? `L${at(inner, stop)}A${f(inner)},${f(inner)} 0 ${large} 1 ${at(inner, start)}Z`
      : `L${f(cx)},${f(cy)}Z`;
  return d;
}

// Curves: copied from packages/native/src/components/charts/scale.ts.

const f = (n: number) => Number(n.toFixed(2));
const pt = ([x, y]: Point) => `${f(x)},${f(y)}`;

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
    const p = (s0 * h1 + s1 * h0) / (h0 + h1 || 1);
    t[i] =
      (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
  }
  // d3's ends: the one-sided three-point estimate.
  t[0] = n > 2 ? (3 * slopes[0] - t[1]) / 2 : slopes[0];
  t[n - 1] = n > 2 ? (3 * slopes[n - 2] - t[n - 2]) / 2 : slopes[0];
  return t;
}

/**
 * The commands that continue a path through `points` (after its `M`),
 * interpolated as d3's curve of that name.
 */
function curveSegments(points: Point[], curve: CurveType): string {
  let d = "";
  const kind = curve.replace(/(Closed|Open|X|Y)$/, "");
  if (kind === "natural" && points.length > 2) {
    const [ax, bx] = naturalControls(points.map((p) => p[0]));
    const [ay, by] = naturalControls(points.map((p) => p[1]));
    for (let i = 1; i < points.length; i++) {
      d += `C${pt([ax[i - 1], ay[i - 1]])} ${pt([bx[i - 1], by[i - 1]])} ${pt(points[i])}`;
    }
    return d;
  }
  if (kind === "monotone" && points.length > 2) {
    const t = monotoneTangents(points);
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const dx = (x1 - x0) / 3;
      d += `C${pt([x0 + dx, y0 + dx * t[i - 1]])} ${pt([x1 - dx, y1 - dx * t[i]])} ${pt([x1, y1])}`;
    }
    return d;
  }
  if (kind === "bump") {
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const mx = (x0 + x1) / 2;
      d += `C${pt([mx, y0])} ${pt([mx, y1])} ${pt([x1, y1])}`;
    }
    return d;
  }
  if (kind === "basis" && points.length > 2) {
    // d3's uniform B-spline, clamped to the end points.
    const [p0, p1] = points;
    d += `L${pt([(5 * p0[0] + p1[0]) / 6, (5 * p0[1] + p1[1]) / 6])}`;
    const bezier = (a: Point, b: Point, c: Point) =>
      `C${pt([(2 * a[0] + b[0]) / 3, (2 * a[1] + b[1]) / 3])} ${pt([(a[0] + 2 * b[0]) / 3, (a[1] + 2 * b[1]) / 3])} ${pt([(a[0] + 4 * b[0] + c[0]) / 6, (a[1] + 4 * b[1] + c[1]) / 6])}`;
    for (let i = 2; i < points.length; i++) d += bezier(points[i - 2], points[i - 1], points[i]);
    const [a, b] = points.slice(-2);
    return `${d}${bezier(a, b, b)}L${pt(b)}`;
  }
  for (let i = 1; i < points.length; i++) {
    const [x0] = points[i - 1];
    const [x1, y1] = points[i];
    if (kind === "step") d += `H${f((x0 + x1) / 2)}V${f(y1)}H${f(x1)}`;
    // Run backwards (an area's base), a step before reads as a step after.
    else if (kind === "stepBefore") d += x1 >= x0 ? `V${f(y1)}H${f(x1)}` : `H${f(x1)}V${f(y1)}`;
    else if (kind === "stepAfter") d += x1 >= x0 ? `H${f(x1)}V${f(y1)}` : `V${f(y1)}H${f(x1)}`;
    else d += `L${pt([x1, y1])}`;
  }
  return d;
}

/** An SVG path through `points` (left to right), interpolated as d3's curve of that name. */
export function curvePath(points: Point[], curve: CurveType = "linear"): string {
  if (points.length === 0) return "";
  return `M${pt(points[0])}${curveSegments(points, curve)}`;
}

/**
 * The closed outline of an area: along `top`, then back along `base` (the
 * same curve, run backwards, as d3's area draws it).
 */
export function areaPath(top: Point[], base: Point[], curve: CurveType = "linear"): string {
  if (top.length === 0) return "";
  const back = [...base].reverse();
  return `${curvePath(top, curve)}L${pt(back[0])}${curveSegments(back, curve)}Z`;
}
