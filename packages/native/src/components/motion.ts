import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** The device's reduce-motion setting, kept up to date. */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((on) => live && setReduce(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduce);
    return () => {
      live = false;
      sub?.remove();
    };
  }, []);
  return reduce;
}

/**
 * Seconds since the component started animating, updated every frame while
 * `active`. Drawings that move in several ways at once (the mascot, the logo
 * loader) compute each pose from this one clock instead of running a separate
 * `Animated` loop per part, which react-native-svg can't drive natively anyway.
 */
export function useFrameTime(active: boolean) {
  const [time, setTime] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const tick = (now: number) => {
      if (start.current === null) start.current = now;
      setTime((now - start.current) / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);
  return time;
}

/** A CSS cubic-bezier(x1, y1, x2, y2) timing function, solved for x. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) =>
    3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 20; i++) {
      const value = at(x1, x2, t);
      if (Math.abs(value - x) < 1e-4) break;
      if (value < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return at(y1, y2, t);
  };
}

export const ease = cubicBezier(0.25, 0.1, 0.25, 1);
export const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

/**
 * A CSS @keyframes track at `progress` (0 to 1): stops as `[offset, value]`,
 * eased between with `timing` (per segment, the start stop's own one if given).
 */
export function keyframes(
  progress: number,
  stops: readonly (readonly [number, number] | readonly [number, number, (x: number) => number])[],
  timing: (x: number) => number = easeInOut,
) {
  const p = ((progress % 1) + 1) % 1;
  for (let i = 0; i < stops.length - 1; i++) {
    const [from, a, own] = stops[i];
    const [to, b] = stops[i + 1];
    if (p >= from && p <= to) {
      if (to === from) return b;
      const curve = own ?? timing;
      return a + (b - a) * curve((p - from) / (to - from));
    }
  }
  return stops[stops.length - 1][1];
}
