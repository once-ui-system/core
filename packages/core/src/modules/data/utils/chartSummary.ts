import type { DataPoint, DateConfig, SeriesConfig, ValueFormat } from "../interfaces.js";
import { chartSeries, DEFAULT_CHART_LOCALE, makeValueFormatter } from "./chartSeries.js";
import { formatDate } from "./formatDate.js";

/**
 * What a chart's summary is written from: the same data, series, x key and
 * number format the chart draws with. `kind: "pie"` reads `xKey` as the slice
 * names and the first series as the slice sizes.
 */
export interface ChartSummaryInput {
  data: readonly DataPoint[];
  series?: SeriesConfig | SeriesConfig[];
  xKey?: string;
  kind?: "cartesian" | "pie";
  valueFormat?: ValueFormat;
  locale?: string;
  /** Writes date x values the way the axis does. */
  date?: DateConfig;
  /** A plain-text title, put in front of the summary. */
  title?: string;
}

/** The hidden table a chart carries: the x values as rows, one column per series. */
export interface ChartSummaryTable {
  columns: string[];
  rows: { x: string; values: string[] }[];
}

/** How many series and slices a summary names before it says "and N more". */
const MAX_SERIES = 3;
const MAX_SLICES = 5;

/** `A`, `A and B`, `A, B and C`. */
function list(items: string[]): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** An x value as the axis writes it: the row's `label`, a formatted date, or the value. */
function xText(value: unknown, row: DataPoint, date: DateConfig | undefined, locale: string) {
  const written = formatDate(value, date, row) as unknown;
  if (written instanceof Date) {
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(written);
    } catch {
      return written.toISOString().slice(0, 10);
    }
  }
  return written === undefined || written === null ? "" : String(written);
}

function numberAt(row: DataPoint, key: string): number | undefined {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function resolve(input: ChartSummaryInput) {
  const locale = input.locale ?? DEFAULT_CHART_LOCALE;
  const { xKey, series } = chartSeries(input.data ?? [], input.series, input.xKey);
  const base = makeValueFormatter(input.valueFormat, locale);
  const formats = series.map((s) => (s.format ? makeValueFormatter(s.format, locale) : base));
  return { locale, xKey, series, formats };
}

/**
 * A short plain-language summary of a chart, in English, with numbers in the
 * chart's format and locale:
 *
 * - `"Revenue and Cost, Jan to Dec. Revenue: highest 12,400 in Aug, lowest 3,100 in Feb."`
 * - `"Share by browser: Chrome 62%, Safari 21%, Firefox 9%."`
 *
 * It states only what is in the data: the series, the x range, and each
 * series' highest and lowest point.
 */
export function chartSummary(input: ChartSummaryInput): string {
  const lead = input.title ? `${input.title.trim().replace(/[.:]$/, "")}` : "";
  if (!input.data || input.data.length === 0) return lead ? `${lead}. No data.` : "No data.";
  const { locale, xKey, series, formats } = resolve(input);
  const x = (row: DataPoint) => xText(row[xKey], row, input.date, locale);

  if (input.kind === "pie") {
    const key = series[0]?.key;
    if (!key) return lead ? `${lead}. No data.` : "No data.";
    const slices = input.data
      .map((row) => ({ name: x(row), value: numberAt(row, key) ?? 0 }))
      .filter((s) => s.value > 0);
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    const percent = makeValueFormatter({ style: "percent", maximumFractionDigits: 0 }, locale);
    const shown = [...slices].sort((a, b) => b.value - a.value).slice(0, MAX_SLICES);
    const parts = shown.map((s) => `${s.name} ${percent(total ? s.value / total : 0)}`);
    const rest = slices.length - shown.length;
    const head =
      lead || (xKey && xKey !== "name" && xKey !== "label" ? `Share by ${xKey}` : "Share");
    if (parts.length === 0) return `${head}: no data.`;
    return `${head}: ${parts.join(", ")}${rest > 0 ? ` and ${rest} more` : ""}.`;
  }

  const first = input.data[0];
  const last = input.data[input.data.length - 1];
  const range = input.data.length > 1 ? `${x(first)} to ${x(last)}` : x(first);
  const names =
    series.length > MAX_SERIES + 1 ? `${series.length} series` : list(series.map((s) => s.label));
  const sentences = [[names, range].filter(Boolean).join(", ")];

  series.slice(0, MAX_SERIES).forEach((s, index) => {
    let high: { value: number; row: DataPoint } | undefined;
    let low: { value: number; row: DataPoint } | undefined;
    for (const row of input.data) {
      const value = numberAt(row, s.key);
      if (value === undefined) continue;
      if (!high || value > high.value) high = { value, row };
      if (!low || value < low.value) low = { value, row };
    }
    if (!high || !low) return;
    const write = formats[index];
    sentences.push(
      high.value === low.value
        ? `${s.label}: ${write(high.value)} throughout`
        : `${s.label}: highest ${write(high.value)} in ${x(high.row)}, lowest ${write(low.value)} in ${x(low.row)}`,
    );
  });
  if (series.length > MAX_SERIES) sentences.push(`and ${series.length - MAX_SERIES} more series`);

  return `${lead ? `${lead}. ` : ""}${sentences.join(". ")}.`;
}

/**
 * The values behind a chart, written as the chart writes them, for a table a
 * screen reader can walk cell by cell. A pie adds each slice's share.
 */
export function chartSummaryTable(input: ChartSummaryInput): ChartSummaryTable {
  const { locale, xKey, series, formats } = resolve(input);
  const data = input.data ?? [];
  const x = (row: DataPoint) => xText(row[xKey], row, input.date, locale);
  const cell = (row: DataPoint, index: number) => {
    const value = numberAt(row, series[index].key);
    return value === undefined ? "" : formats[index](value);
  };

  if (input.kind === "pie") {
    const s = series[0];
    if (!s) return { columns: [xKey], rows: [] };
    const total = data.reduce((sum, row) => sum + Math.max(0, numberAt(row, s.key) ?? 0), 0);
    const percent = makeValueFormatter("percent", locale);
    return {
      columns: [xKey, s.label, "Share"],
      rows: data.map((row) => ({
        x: x(row),
        values: [cell(row, 0), total ? percent((numberAt(row, s.key) ?? 0) / total) : ""],
      })),
    };
  }

  return {
    columns: [xKey, ...series.map((s) => s.label)],
    rows: data.map((row) => ({ x: x(row), values: series.map((_, index) => cell(row, index)) })),
  };
}
