"use client";

import React, { Suspense } from "react";
import { MissingDependency } from "../../utils/MissingDependency";
import type { PieChartProps } from "./PieChart.impl";

const PieChartImpl = React.lazy(() =>
  import("./PieChart.impl").catch(() => {
    console.warn(
      '[@once-ui-system/core] <PieChart /> requires the "recharts" package. Install it with: npm install recharts',
    );
    return {
      default: () => <MissingDependency component="PieChart" packageName="recharts" />,
    };
  }),
);

const PieChart: React.FC<PieChartProps> = (props) => (
  <Suspense fallback={null}>
    <PieChartImpl {...props} />
  </Suspense>
);

PieChart.displayName = "PieChart";

export type { PieChartProps };
export { PieChart };
