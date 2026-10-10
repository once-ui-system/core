"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency";
import type { BarChartProps } from "./BarChart.impl";

const BarChartImpl = React.lazy(() =>
  import("./BarChart.impl").catch(() => {
    console.warn(
      '[@once-ui-system/core] <BarChart /> requires the "recharts" package. Install it with: npm install recharts',
    );
    return {
      default: () => <MissingDependency component="BarChart" packageName="recharts" />,
    };
  }),
);

const BarChart: React.FC<BarChartProps> = (props) => (
  <Suspense fallback={null}>
    <BarChartImpl {...props} />
  </Suspense>
);

BarChart.displayName = "BarChart";

export type { BarChartProps };
export { BarChart };
