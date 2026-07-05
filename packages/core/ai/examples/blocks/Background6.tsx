"use client";

import { Background } from "@once-ui-system/core";

/** Ambient hero background — glow + dots (Waitlist1 pattern) */
export const Background6 = () => (
  <Background
    position="absolute"
    top="0"
    left="0"
    fill
    pointerEvents="none"
    gradient={{
      display: true,
      colorStart: "brand-alpha-medium",
      colorEnd: "static-transparent",
      x: 50,
      y: 0,
      width: 150,
      height: 80,
      opacity: 60,
    }}
    dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
  />
);
