"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency";
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

const LineBarChart: React.FC<LineBarChartProps> = (props) => (
  <Suspense fallback={null}>
    <LineBarChartImpl {...props} />
  </Suspense>
);

LineBarChart.displayName = "LineBarChart";

export type { LineBarChartProps };
export { LineBarChart };
