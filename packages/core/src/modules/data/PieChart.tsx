"use client";

import type { DataPoint } from "./interfaces.js";
import PieChartImpl, { type PieChartProps } from "./PieChart.impl.js";

/**
 * Generic over the row type: `<PieChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 * Drawn as SVG on the server and in the browser, with no chart library.
 */
const PieChart = <T extends object = DataPoint>(props: PieChartProps<T>) => (
  <PieChartImpl {...(props as unknown as PieChartProps)} />
);

PieChart.displayName = "PieChart";

export type { PieChartProps };
export { PieChart };
