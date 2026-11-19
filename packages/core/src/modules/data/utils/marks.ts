import type { ChartAnnotation, ChartMarkTone, ChartThreshold, DataPoint } from "../interfaces.js";

/**
 * How a tone draws, so a limit reads without its colour: the heavier the
 * tone, the heavier and more solid the line, and only warning and danger
 * bands are hatched.
 */
export interface MarkStroke {
  color: string;
  width: number;
  dash?: string;
  /** The band's tint. */
  fill: string;
  /** The band's hatch lines, and the room between them; none for a plain tint. */
  hatch?: { color: string; gap: number };
  /** The label's text colour. */
  text: string;
}

export function markStroke(tone: ChartMarkTone = "warning"): MarkStroke {
  const color = `var(--${tone}-border-strong)`;
  const text = `var(--${tone}-on-background-strong)`;
  const fill = `var(--${tone}-alpha-weak)`;
  if (tone === "danger") {
    return { color, width: 2, fill, hatch: { color: "var(--danger-alpha-strong)", gap: 6 }, text };
  }
  if (tone === "warning") {
    return {
      color,
      width: 1.5,
      dash: "6 4",
      fill,
      hatch: { color: "var(--warning-alpha-medium)", gap: 10 },
      text,
    };
  }
  return { color, width: 1, dash: "2 3", fill, text };
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** The values the value axis must reach so every threshold line and band end is in view. */
export function thresholdValues(thresholds: readonly ChartThreshold[] | undefined): number[] {
  if (!thresholds) return [];
  return thresholds.flatMap((t) => [t.value, t.from, t.to].filter(isNum));
}

/** Two x values are the same mark: a Date and its ISO string, a number and its text. */
function sameX(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  const time = (v: unknown) =>
    v instanceof Date ? v.getTime() : typeof v === "string" ? Date.parse(v) : Number.NaN;
  const ta = time(a);
  if (Number.isFinite(ta) && ta === time(b)) return true;
  return String(a) === String(b);
}

/** The row an annotation marks, or -1 when no row has its x. */
export function annotationIndex(
  rows: readonly DataPoint[],
  xKey: string,
  annotation: ChartAnnotation,
): number {
  return rows.findIndex((row) => sameX(row[xKey], annotation.x));
}

/** Is `v` out of limits for `t`: past a line on its side, or inside a band. */
export function beyond(t: ChartThreshold, v: number): boolean {
  if (t.direction === "none") return false;
  if (isNum(t.value)) {
    return t.direction === "below" ? v < t.value : v > t.value;
  }
  if (!isNum(t.from) && !isNum(t.to)) return false;
  return (!isNum(t.from) || v >= t.from) && (!isNum(t.to) || v <= t.to);
}

/**
 * The sentences a chart's summary adds for its limits and moments, stating
 * only what the rows hold: `"Coolant: above High alarm (320) at 3 points,
 * first at 14:05."`, `"No point above Trip (340)."`, `"Marked: Scram at 14:20."`
 */
export function marksSummary({
  rows,
  series,
  thresholds = [],
  annotations = [],
  xKey,
  x,
  write,
  maxSeries = 3,
}: {
  rows: readonly DataPoint[];
  series: { key: string; label: string }[];
  thresholds?: readonly ChartThreshold[];
  annotations?: readonly ChartAnnotation[];
  xKey: string;
  x: (row: DataPoint) => string;
  write: (value: number) => string;
  maxSeries?: number;
}): string[] {
  const sentences: string[] = [];
  for (const t of thresholds) {
    const line = isNum(t.value);
    if (t.direction === "none") continue;
    if (!line && !isNum(t.from) && !isNum(t.to)) continue;
    const where = line
      ? `${t.direction === "below" ? "below" : "above"} ${t.label} (${write(t.value as number)})`
      : `in ${t.label} (${
          isNum(t.from) && isNum(t.to)
            ? `${write(t.from)} to ${write(t.to)}`
            : isNum(t.from)
              ? `${write(t.from)} and up`
              : `up to ${write(t.to as number)}`
        })`;
    const hits = series.slice(0, maxSeries).flatMap((s) => {
      const rowsBeyond = rows.filter((row) => isNum(row[s.key]) && beyond(t, row[s.key] as number));
      if (rowsBeyond.length === 0) return [];
      const n = rowsBeyond.length;
      return [
        `${s.label}: ${where} at ${n} ${n === 1 ? "point" : "points"}, first at ${x(rowsBeyond[0])}`,
      ];
    });
    sentences.push(...(hits.length ? hits : [`No point ${where}`]));
  }
  const marked = annotations.map((a) => {
    const row = rows.find((r) => sameX(r[xKey], a.x));
    return `${a.label} at ${row ? x(row) : String(a.x)}`;
  });
  if (marked.length) sentences.push(`Marked: ${marked.join(", ")}`);
  return sentences;
}
