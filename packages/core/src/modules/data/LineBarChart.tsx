"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency";
import type { DataPoint } from "./interfaces";
import type { LineBarChartProps } from "./LineBarChart.impl";

const LineBarChartImpl = React.lazy(() =>
  import("./LineBarChart.impl").catch(() => {
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
const LineBarChart = <T extends object = DataPoint>(props: LineBarChartProps<T>) => (
  <Suspense fallback={null}>
    <LineBarChartImpl {...(props as unknown as LineBarChartProps)} />
  </Suspense>
);

LineBarChart.displayName = "LineBarChart";

export type { LineBarChartProps };
export { LineBarChart };
