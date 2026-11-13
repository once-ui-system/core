"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { BarChart } from "@mui/x-charts/BarChart";
import { weeklyActivity } from "@/lib/data";

const HEIGHT = 280;

/**
 * Charts measure their container in the browser, so render them only after
 * mount to keep the server and first client render identical.
 */
export default function ActivityChart() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      role="img"
      aria-label="Bar chart of issues opened and closed per day this week"
      sx={{ width: "100%", height: HEIGHT }}
    >
      {mounted ? (
        <BarChart
          height={HEIGHT}
          skipAnimation
          xAxis={[{ scaleType: "band", data: weeklyActivity.days }]}
          series={[
            { data: weeklyActivity.opened, label: "Opened" },
            { data: weeklyActivity.closed, label: "Closed" },
          ]}
        />
      ) : (
        <Skeleton variant="rounded" width="100%" height={HEIGHT} />
      )}
    </Box>
  );
}
