import type { ColorValue } from "../../../types.js";
import type { DataPoint, SeriesConfig, ValueFormat } from "../interfaces.js";
import { getDistributedColor } from "./colorDistribution.js";

/** A series with everything a chart draws it with filled in. */
export interface ResolvedSeries {
  key: string;
  label: string;
  color: ColorValue;
  format?: ValueFormat;
}

/**
 * The x key and the series a chart draws. Without `series`, every key of the
 * first row but the x key and `label` is one; without `xKey`, the x key is the
 * first key that is not a series. The x key is never drawn as a series.
 */
export function chartSeries(
  data: readonly DataPoint[],
  series: SeriesConfig | SeriesConfig[] | undefined,
  xKey?: string,
): { xKey: string; series: ResolvedSeries[] } {
  const given = Array.isArray(series) ? series : series ? [series] : [];
  const keys = Object.keys(data[0] || {});
  const givenKeys = given.map((s) => s.key as string);
  // `label` names a row on the axis, so it is the x key only when nothing else is.
  const free = keys.filter((key) => !givenKeys.includes(key));
  const x = xKey ?? free.find((key) => key !== "label") ?? free[0] ?? "name";
  const configs: SeriesConfig[] =
    given.length > 0
      ? given
      : keys.filter((key) => key !== x && key !== "label").map((key) => ({ key }));
  return {
    xKey: x,
    series: configs.map((s, index) => ({
      key: s.key as string,
      label: s.label ?? (s.key as string),
      color: s.color || getDistributedColor(index, configs.length),
      format: s.format,
    })),
  };
}

/** The `"en-US"` default: the server and every browser write the same digits. */
export const DEFAULT_CHART_LOCALE = "en-US";

/**
 * A function that writes a number as `format` says, in `locale`. A locale the
 * platform does not know falls back to the default instead of throwing.
 */
export function makeValueFormatter(
  format: ValueFormat | undefined,
  locale: string = DEFAULT_CHART_LOCALE,
): (value: number) => string {
  if (typeof format === "function") return format;
  const options: Intl.NumberFormatOptions =
    format === "compact"
      ? { notation: "compact", maximumFractionDigits: 1 }
      : format === "percent"
        ? { style: "percent", maximumFractionDigits: 1 }
        : format && format !== "number"
          ? format
          : { maximumFractionDigits: 2 };
  let intl: Intl.NumberFormat;
  try {
    intl = new Intl.NumberFormat(locale, options);
  } catch {
    intl = new Intl.NumberFormat(DEFAULT_CHART_LOCALE, options);
  }
  return (value: number) => intl.format(value);
}

/** Rows by their x value, so a tick finds its row without scanning the data. */
export function rowsByX(data: readonly DataPoint[], xKey: string): Map<unknown, DataPoint> {
  const map = new Map<unknown, DataPoint>();
  for (const row of data) if (!map.has(row[xKey])) map.set(row[xKey], row);
  return map;
}

/**
 * The value axis and tooltip writers for a chart. Both are undefined when
 * nothing about formatting was asked for, so a chart without `valueFormat`,
 * `locale` or a series `format` draws exactly as 2.x did. A percent stack's
 * axis runs 0 to 1 and is written as percentages; its tooltip keeps the
 * values themselves.
 */
export function chartFormatters(
  valueFormat: ValueFormat | undefined,
  locale: string | undefined,
  series: ResolvedSeries[],
  percentAxis = false,
): {
  axis?: (value: number) => string;
  tooltip?: (value: number, dataKey?: string) => string;
} {
  const asked = valueFormat !== undefined || locale !== undefined || series.some((s) => s.format);
  if (!asked && !percentAxis) return {};
  const base = makeValueFormatter(valueFormat, locale);
  const axis = percentAxis ? makeValueFormatter("percent", locale) : base;
  if (!asked) return { axis };
  const byKey = new Map(
    series.map((s) => [s.key, s.format ? makeValueFormatter(s.format, locale) : base]),
  );
  return { axis, tooltip: (value, dataKey) => (byKey.get(dataKey ?? "") ?? base)(value) };
}

/**
 * The width a value axis needs for its longest label, so a long format
 * (`1 950 000 Ft`) is not cut at the chart's edge. Ticks are rounded values
 * within the data's range, so the extremes (summed when stacked) are the
 * longest; 6.5px a character at the 11px tick size. Never under the 64px the
 * axis always had.
 */
export function valueAxisWidth(
  data: readonly DataPoint[],
  keys: string[],
  format: ((value: number) => string) | undefined,
  stacked = false,
): number {
  if (!format) return 64;
  let min = 0;
  let max = 0;
  for (const row of data) {
    const values = keys.map((key) => row[key]).filter((v): v is number => typeof v === "number");
    const candidates = stacked ? [values.reduce((sum, v) => sum + v, 0)] : values;
    for (const v of candidates) {
      if (v > max) max = v;
      if (v < min) min = v;
    }
  }
  const longest = Math.max(format(max).length, format(min).length);
  return Math.max(64, Math.ceil(longest * 6.5) + 16);
}
