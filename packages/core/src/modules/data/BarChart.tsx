"use client";

import BarChartImpl, { type BarChartProps } from "./BarChart.impl.js";
import type { DataPoint } from "./interfaces.js";

/**
 * Generic over the row type: `<BarChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 * Drawn as SVG on the server and in the browser, with no chart library.
 */
const BarChart = <T extends object = DataPoint>(props: BarChartProps<T>) => (
  <BarChartImpl {...(props as unknown as BarChartProps)} />
);

BarChart.displayName = "BarChart";

export type { BarChartProps };
export { BarChart };
