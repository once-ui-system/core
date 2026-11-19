"use client";

import { useEffect, useRef, useState } from "react";

export type CountUpEasing = "linear" | "ease-out" | "ease-in-out";

export interface CountUpOptions {
  /** Milliseconds a run from the shown number to `value` takes. */
  duration?: number;
  easing?: CountUpEasing;
  decimals?: number;
}

const ease = (easing: CountUpEasing, t: number): number => {
  switch (easing) {
    case "linear":
      return t;
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    default:
      return 1 - (1 - t) ** 3;
  }
};

/**
 * The number to show while counting towards `value`, one step per animation
 * frame. Core's own count-up (ProgressBar, RadialGauge, DataTooltip), so those
 * do not depend on CountFx, which is an effect and leaves core for
 * `@once-ui-system/fx`. It counts exactly as CountFx's `simple` effect does:
 * a run starts from what is shown, so a value changed back mid-run still
 * lands, and it always settles on `value` itself.
 */
export function useCountUp(
  value: number,
  { duration = 1000, easing = "ease-out", decimals }: CountUpOptions = {},
): number {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    if (value === displayRef.current) return;
    const from = displayRef.current;
    const difference = value - from;
    let start: number | undefined;
    let frame: number;

    const commit = (next: number) => {
      displayRef.current = next;
      setDisplay(next);
    };

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const current = from + difference * ease(easing, progress);
      commit(
        decimals !== undefined ? Number.parseFloat(current.toFixed(decimals)) : Math.floor(current),
      );
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        commit(value);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, easing, decimals]);

  return display;
}

/** `1234567.5` → `"1,234,567.5"` with `separator=","`; CountFx's default format. */
export function formatCount(value: number, separator?: string, decimals?: number): string {
  const text = decimals !== undefined ? value.toFixed(decimals) : value.toString();
  if (!separator) return text;
  const parts = text.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return parts.join(".");
}
