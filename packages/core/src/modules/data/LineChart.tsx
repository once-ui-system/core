"use client";

import { ChartA11y } from "./ChartPlot.js";
import type { DataPoint } from "./interfaces.js";
import LineChartImpl, { type LineChartProps } from "./LineChart.impl.js";

/**
 * Generic over the row type: `<LineChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 * Drawn as SVG on the server and in the browser, with no chart library.
 */
const LineChart = <T extends object = DataPoint>({
  summary,
  "aria-label": label,
  ...props
}: LineChartProps<T>) => (
  // The summary and its table are written here, from the props, so the
  // renderer only hands its plot the rows it draws.
  <ChartA11y props={props} summary={summary} label={label}>
    <LineChartImpl {...(props as unknown as LineChartProps)} />
  </ChartA11y>
);

LineChart.displayName = "LineChart";

export type { LineChartProps };
export { LineChart };
