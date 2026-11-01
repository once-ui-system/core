"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import { Row, type RowProps } from "../../components/Row.js";
import { ChartSummary } from "./ChartSummary.js";
import type { DataPoint, DateConfig, SeriesConfig, ValueFormat } from "./interfaces.js";
import { type ChartSummaryInput, chartSummary } from "./utils/chartSummary.js";

/**
 * What a chart's public shell knows about how to describe it. The shell
 * (`LineChart.tsx`) provides it from the props, so a renderer only hands its
 * plot the rows it draws: `<ChartPlot data={filteredData}>`.
 *
 * Internal: not exported from the data barrel.
 */
interface ChartA11yValue {
  kind: "cartesian" | "pie";
  series?: SeriesConfig | SeriesConfig[];
  xKey?: string;
  valueFormat?: ValueFormat;
  locale?: string;
  date?: DateConfig;
  title?: ReactNode;
  loading?: boolean;
  error?: boolean;
  /** The author's `summary`: replaces the generated text, after the title. */
  summary?: string;
  /** The author's `aria-label`: the plot's whole accessible name. */
  label?: string;
}

const ChartA11yContext = createContext<ChartA11yValue | null>(null);

/** The chart props a shell reads its description from. */
interface ChartA11yProps {
  series?: unknown;
  xKey?: unknown;
  valueFormat?: ValueFormat;
  locale?: string;
  date?: DateConfig;
  title?: ReactNode;
  loading?: boolean;
  error?: boolean;
  /** PieChart: the key that sizes each slice, and the one that names it. */
  dataKey?: unknown;
  nameKey?: unknown;
}

function ChartA11y({
  kind = "cartesian",
  props,
  summary,
  label,
  children,
}: {
  kind?: "cartesian" | "pie";
  props: ChartA11yProps;
  summary?: string;
  label?: string;
  children: ReactNode;
}) {
  const { series, xKey, valueFormat, locale, date, title, loading, error, dataKey, nameKey } =
    props;
  const value = useMemo<ChartA11yValue>(() => {
    const given = (Array.isArray(series) ? series : series ? [series] : []) as SeriesConfig[];
    if (kind === "pie") {
      const key = (dataKey as string | undefined) ?? "value";
      const named = given.find((s) => s.key === key);
      return {
        kind,
        series: { key, label: named?.label, format: named?.format } as SeriesConfig,
        xKey: (nameKey as string | undefined) ?? "name",
        valueFormat,
        locale,
        date,
        title,
        loading,
        error,
        summary,
        label,
      };
    }
    return {
      kind,
      series: series as SeriesConfig[] | undefined,
      xKey: xKey as string | undefined,
      valueFormat,
      locale,
      date,
      title,
      loading,
      error,
      summary,
      label,
    };
  }, [
    kind,
    series,
    xKey,
    valueFormat,
    locale,
    date,
    title,
    loading,
    error,
    dataKey,
    nameKey,
    summary,
    label,
  ]);
  return <ChartA11yContext.Provider value={value}>{children}</ChartA11yContext.Provider>;
}

const plainText = (node: ReactNode) =>
  typeof node === "string" || typeof node === "number" ? String(node) : undefined;

/**
 * A chart's plot region: a `Row` that is one image to assistive technology,
 * named by the chart's summary, with the summary's data table in front of it
 * (hidden from sight, inside the card). While the chart loads, fails or has
 * no rows it is a plain `Row`, and the status inside it is read as it is.
 */
function ChartPlot({
  data,
  children,
  ...row
}: RowProps & { data: readonly DataPoint[] | undefined }) {
  const ctx = useContext(ChartA11yContext);
  const ready = !ctx?.loading && !ctx?.error && !!data && data.length > 0;
  const title = plainText(ctx?.title);
  const input = useMemo<ChartSummaryInput>(
    () => ({
      data: data ?? [],
      kind: ctx?.kind,
      series: ctx?.series,
      xKey: ctx?.xKey,
      valueFormat: ctx?.valueFormat,
      locale: ctx?.locale,
      date: ctx?.date,
      title,
    }),
    [data, ctx, title],
  );
  const name = useMemo(() => {
    if (!ready) return undefined;
    if (ctx?.label) return ctx.label;
    if (ctx?.summary) return title ? `${title}. ${ctx.summary}` : ctx.summary;
    return chartSummary(input);
  }, [ready, ctx, title, input]);

  return (
    <>
      {ready && <ChartSummary {...input} />}
      <Row {...row} {...(name ? { role: "img", "aria-label": name } : {})}>
        {children}
      </Row>
    </>
  );
}

export { ChartA11y, ChartPlot };
