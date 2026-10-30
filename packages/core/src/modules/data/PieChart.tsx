"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency.js";
import { ChartA11y } from "./ChartPlot.js";
import type { DataPoint } from "./interfaces.js";
import type { PieChartProps } from "./PieChart.impl.js";

const PieChartImpl = React.lazy<React.ComponentType<PieChartProps>>(() =>
  import("./PieChart.impl.js").catch(() => {
    console.warn(
      '[@once-ui-system/core] <PieChart /> requires the "recharts" package. Install it with: npm install recharts',
    );
    return {
      default: () => <MissingDependency component="PieChart" packageName="recharts" />,
    };
  }),
);

/**
 * Generic over the row type: `<PieChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 */
const PieChart = <T extends object = DataPoint>({
  summary,
  "aria-label": label,
  ...props
}: PieChartProps<T>) => (
  // The summary and its table are written here, from the props, so the
  // renderer only hands its plot the rows it draws.
  <ChartA11y kind="pie" props={props} summary={summary} label={label}>
    <Suspense fallback={null}>
      <PieChartImpl {...(props as unknown as PieChartProps)} />
    </Suspense>
  </ChartA11y>
);

PieChart.displayName = "PieChart";

export type { PieChartProps };
export { PieChart };
