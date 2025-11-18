"use client";

import React, { useEffect, useState } from "react";
import { RadialGauge } from "@once-ui-system/core";

// Animated speed meter demo for RadialGauge docs
export function RadialGaugeSpeedDemo() {
  const [value, setValue] = useState(4);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    const cycle = () => {
      timeouts.push(setTimeout(() => setValue(96), 500));
      timeouts.push(setTimeout(() => setValue(4), 2500));
      timeouts.push(setTimeout(cycle, 4500));
    };
    
    cycle();

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <RadialGauge
      width={260}
      height={260}
      value={value}
      hue={value < 50 ? "danger" : value < 80 ? "neutral" : "success"}
      unit="km/h"
      angle={{
        start: -20,
        sweep: 220,
      }}
      line={{
        count: 24,
        width: 2,
        length: 12,
      }}
    />
  );
}
