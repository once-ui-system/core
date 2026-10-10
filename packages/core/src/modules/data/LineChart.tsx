"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency";
import type { LineChartProps } from "./LineChart.impl";

const LineChartImpl = React.lazy(() =>
  import("./LineChart.impl").catch(() => {
    console.warn(
      '[@once-ui-system/core] <LineChart /> requires the "recharts" package. Install it with: npm install recharts',
    );
    return {
      default: () => <MissingDependency component="LineChart" packageName="recharts" />,
    };
  }),
);

const LineChart: React.FC<LineChartProps> = (props) => (
  <Suspense fallback={null}>
    <LineChartImpl {...props} />
  </Suspense>
);

LineChart.displayName = "LineChart";

export type { LineChartProps };
export { LineChart };
