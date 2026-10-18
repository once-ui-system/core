"use client";

import type React from "react";
import { forwardRef } from "react";
import { Text } from "../components/Text.js";
import { type CountUpEasing, formatCount, useCountUp } from "./useCountUp.js";

export interface CountUpProps extends React.ComponentProps<typeof Text> {
  value: number;
  /** Milliseconds per run. */
  duration?: number;
  easing?: CountUpEasing;
  separator?: string;
  decimals?: number;
  children?: React.ReactNode;
}

/**
 * A number that counts to `value`. Internal: what ProgressBar, RadialGauge
 * and DataTooltip render in place of CountFx, with the same markup as CountFx's
 * `simple` effect (a `span` around the `Text`), so they look the same.
 */
export const CountUp = forwardRef<HTMLSpanElement, CountUpProps>(
  ({ value, duration, easing, separator, decimals, children, ...text }, ref) => {
    const shown = useCountUp(value, { duration, easing, decimals });
    return (
      <span ref={ref}>
        <Text {...text}>
          {formatCount(shown, separator, decimals)}
          {children}
        </Text>
      </span>
    );
  },
);

CountUp.displayName = "CountUp";
