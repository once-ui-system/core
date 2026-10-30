"use client";

import type { DataPoint } from "./interfaces.js";
import LineBarChartImpl, { type LineBarChartProps } from "./LineBarChart.impl.js";

/**
 * Generic over the row type: `<LineBarChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 * Drawn as SVG on the server and in the browser, with no chart library.
 */
const LineBarChart = <T extends object = DataPoint>(props: LineBarChartProps<T>) => (
  <LineBarChartImpl {...(props as unknown as LineBarChartProps)} />
);

LineBarChart.displayName = "LineBarChart";

export type { LineBarChartProps };
export { LineBarChart };
