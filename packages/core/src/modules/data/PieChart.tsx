"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency.js";
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
const PieChart = <T extends object = DataPoint>(props: PieChartProps<T>) => (
  <Suspense fallback={null}>
    <PieChartImpl {...(props as unknown as PieChartProps)} />
  </Suspense>
);

PieChart.displayName = "PieChart";

export type { PieChartProps };
export { PieChart };
