"use client";

import BarChartImpl, { type BarChartProps } from "./BarChart.impl.js";
import { ChartA11y } from "./ChartPlot.js";
import type { DataPoint } from "./interfaces.js";

/**
 * Generic over the row type: `<BarChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 * Drawn as SVG on the server and in the browser, with no chart library.
 */
const BarChart = <T extends object = DataPoint>({
  summary,
  "aria-label": label,
  ...props
}: BarChartProps<T>) => (
  // The summary and its table are written here, from the props, so the
  // renderer only hands its plot the rows it draws.
  <ChartA11y props={props} summary={summary} label={label}>
    <BarChartImpl {...(props as unknown as BarChartProps)} />
  </ChartA11y>
);

BarChart.displayName = "BarChart";

export type { BarChartProps };
export { BarChart };
