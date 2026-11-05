"use client";

import { ChartA11y } from "./ChartPlot.js";
import type { DataPoint } from "./interfaces.js";
import PieChartImpl, { type PieChartProps } from "./PieChart.impl.js";

/**
 * Generic over the row type: `<PieChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 * Drawn as SVG on the server and in the browser, with no chart library.
 */
const PieChart = <T extends object = DataPoint>({
  summary,
  "aria-label": label,
  ...props
}: PieChartProps<T>) => (
  // The summary and its table are written here, from the props, so the
  // renderer only hands its plot the rows it draws.
  <ChartA11y kind="pie" props={props} summary={summary} label={label}>
    <PieChartImpl {...(props as unknown as PieChartProps)} />
  </ChartA11y>
);

PieChart.displayName = "PieChart";

export type { PieChartProps };
export { PieChart };
