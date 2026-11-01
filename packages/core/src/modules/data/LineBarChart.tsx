"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency.js";
import { ChartA11y } from "./ChartPlot.js";
import type { DataPoint } from "./interfaces.js";
import type { LineBarChartProps } from "./LineBarChart.impl.js";

const LineBarChartImpl = React.lazy<React.ComponentType<LineBarChartProps>>(() =>
  import("./LineBarChart.impl.js").catch(() => {
    console.warn(
      '[@once-ui-system/core] <LineBarChart /> requires the "recharts" package. Install it with: npm install recharts',
    );
    return {
      default: () => <MissingDependency component="LineBarChart" packageName="recharts" />,
    };
  }),
);

/**
 * Generic over the row type: `<LineBarChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 */
const LineBarChart = <T extends object = DataPoint>({
  summary,
  "aria-label": label,
  ...props
}: LineBarChartProps<T>) => (
  // The summary and its table are written here, from the props, so the
  // renderer only hands its plot the rows it draws.
  <ChartA11y props={props} summary={summary} label={label}>
    <Suspense fallback={null}>
      <LineBarChartImpl {...(props as unknown as LineBarChartProps)} />
    </Suspense>
  </ChartA11y>
);

LineBarChart.displayName = "LineBarChart";

export type { LineBarChartProps };
export { LineBarChart };
