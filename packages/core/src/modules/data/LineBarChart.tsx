"use client";

import { ChartA11y } from "./ChartPlot.js";
import type { DataPoint } from "./interfaces.js";
import LineBarChartImpl, { type LineBarChartProps } from "./LineBarChart.impl.js";

/**
 * Generic over the row type: `<LineBarChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 * Drawn as SVG on the server and in the browser, with no chart library.
 */
const LineBarChart = <T extends object = DataPoint>({
  summary,
  "aria-label": label,
  ...props
}: LineBarChartProps<T>) => (
  // The summary and its table are written here, from the props, so the
  // renderer only hands its plot the rows it draws.
  <ChartA11y props={props} summary={summary} label={label}>
    <LineBarChartImpl {...(props as unknown as LineBarChartProps)} />
  </ChartA11y>
);

LineBarChart.displayName = "LineBarChart";

export type { LineBarChartProps };
export { LineBarChart };
