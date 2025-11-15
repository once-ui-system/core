"use client";

import React, { useEffect, useState } from "react";
import { RadialGauge } from "@once-ui-system/core";

// Animated speed meter demo for RadialGauge docs
export function RadialGaugeSpeedDemo() {
  const [value, setValue] = useState(20);
  const [phase, setPhase] = useState<"accelerate" | "brake">("accelerate");

  useEffect(() => {
    let cooldown = 0;

    const interval = window.setInterval(() => {
      setValue((prev) => {
        // Simple pause when switching phases
        if (cooldown > 0) {
          cooldown -= 1;
          return prev;
        }

        if (phase === "accelerate") {
          const next = prev + 2;
          if (next >= 96) {
            setPhase("brake");
            cooldown = 8;
            return 96;
          }
          return next;
        } else {
          const next = prev - 3;
          if (next <= 18) {
            setPhase("accelerate");
            cooldown = 8;
            return 18;
          }
          return next;
        }
      });
    }, 40);

    return () => {
      window.clearInterval(interval);
    };
  }, [phase]);

  return (
    <RadialGauge
      width={260}
      height={260}
      value={value}
      health={value < 50 ? "bad" : value < 80 ? "normal" : "good"}
      unit="km/h"
      startAngle={-20}
      sweepAngle={220}
      edgePad={4}
    />
  );
}
