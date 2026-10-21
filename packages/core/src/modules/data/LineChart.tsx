"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency.js";
import type { DataPoint } from "./interfaces.js";
import type { LineChartProps } from "./LineChart.impl.js";

const LineChartImpl = React.lazy<React.ComponentType<LineChartProps>>(() =>
  import("./LineChart.impl.js").catch(() => {
    console.warn(
      '[@once-ui-system/core] <LineChart /> requires the "recharts" package. Install it with: npm install recharts',
    );
    return {
      default: () => <MissingDependency component="LineChart" packageName="recharts" />,
    };
  }),
);

/**
 * Generic over the row type: `<LineChart data={rows} series={{ key: "revenue" }} />`
 * takes your own `interface Row` as is, and checks `series` keys against it.
 */
const LineChart = <T extends object = DataPoint>(props: LineChartProps<T>) => (
  <Suspense fallback={null}>
    <LineChartImpl {...(props as unknown as LineChartProps)} />
  </Suspense>
);

LineChart.displayName = "LineChart";

export type { LineChartProps };
export { LineChart };
