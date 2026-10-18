"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency.js";
import type { BarChartProps } from "./BarChart.impl.js";
import type { DataPoint } from "./interfaces.js";

const BarChartImpl = React.lazy(() =>
  import("./BarChart.impl.js").catch(() => {
    console.warn(
      '[@once-ui-system/core] <BarChart /> requires the "recharts" package. Install it with: npm install recharts',
    );
    return {
      default: () => <MissingDependency component="BarChart" packageName="recharts" />,
    };
  }),
);

/**
 * Generic over the row type: `<BarChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 */
const BarChart = <T extends object = DataPoint>(props: BarChartProps<T>) => (
  <Suspense fallback={null}>
    <BarChartImpl {...(props as unknown as BarChartProps)} />
  </Suspense>
);

BarChart.displayName = "BarChart";

export type { BarChartProps };
export { BarChart };
