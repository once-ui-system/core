"use client";

import type { DataPoint } from "./interfaces.js";
import LineChartImpl, { type LineChartProps } from "./LineChart.impl.js";

/**
 * Generic over the row type: `<LineChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 * Drawn as SVG on the server and in the browser, with no chart library.
 */
const LineChart = <T extends object = DataPoint>(props: LineChartProps<T>) => (
  <LineChartImpl {...(props as unknown as LineChartProps)} />
);

LineChart.displayName = "LineChart";

export type { LineChartProps };
export { LineChart };
