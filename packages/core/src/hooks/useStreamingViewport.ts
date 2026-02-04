"use client";

import React from "react";

type NumericKeys<T> = Array<Extract<keyof T, string>>;

type StreamingTarget<T> = Partial<Record<Extract<keyof T, string>, number>>;

type StreamingViewportOptions<T extends Record<string, any>> = {
  initialData: T[];
  windowSize: number;
  intervalMs: number;
  stepMs?: number;
  xKey: Extract<keyof T, string>;
  numericKeys: NumericKeys<T>;
  getNextTarget: (ctx: {
    lastPoint: T;
    nextX: number;
  }) => StreamingTarget<T>;
};

type StreamingViewportResult<T> = {
  data: T[];
  xDomain: [number, number];
  running: boolean;
  setRunning: React.Dispatch<React.SetStateAction<boolean>>;
  reset: () => void;
};

export function useStreamingViewport<T extends Record<string, any>>(
  options: StreamingViewportOptions<T>,
): StreamingViewportResult<T> {
  const {
    initialData,
    windowSize,
    intervalMs,
    stepMs = 16,
    xKey,
    numericKeys,
    getNextTarget,
  } = options;

  const initialDataRef = React.useRef(initialData);
  React.useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const [running, setRunning] = React.useState(true);
  const [state, setState] = React.useState<{ data: T[]; xDomain: [number, number] }>(() => {
    const base = initialData.slice(-windowSize);
    const last = base[base.length - 1];
    const lastX = last ? Number(last[xKey]) : windowSize - 1;
    const right = Number.isFinite(lastX) ? lastX : windowSize - 1;
    return { data: base, xDomain: [right - (windowSize - 1), right] };
  });

  const rafIdRef = React.useRef<number | null>(null);
  const lastStepAtRef = React.useRef<number>(0);
  const cycleStartAtRef = React.useRef<number>(0);
  const lastRealRef = React.useRef<T | null>(null);
  const nextTargetRef = React.useRef<StreamingTarget<T> | null>(null);
  const getNextTargetRef = React.useRef(getNextTarget);
  const numericKeysRef = React.useRef(numericKeys);

  React.useEffect(() => {
    getNextTargetRef.current = getNextTarget;
    numericKeysRef.current = numericKeys;
  }, [getNextTarget, numericKeys]);

  const maxPauseMs = Math.max(intervalMs * 2, 2000);

  const reset = React.useCallback(() => {
    const base = initialDataRef.current.slice(-windowSize);
    const last = base[base.length - 1];
    const lastX = last ? Number(last[xKey]) : windowSize - 1;
    const right = Number.isFinite(lastX) ? lastX : windowSize - 1;
    setState({ data: base, xDomain: [right - (windowSize - 1), right] });

    lastStepAtRef.current = 0;
    cycleStartAtRef.current = 0;
    lastRealRef.current = null;
    nextTargetRef.current = null;
  }, [windowSize, xKey]);

  React.useEffect(() => {
    if (!running) return;

    const step = (now: number) => {
      if (!lastStepAtRef.current) lastStepAtRef.current = now;
      if (!cycleStartAtRef.current) cycleStartAtRef.current = now;

      // If the tab was backgrounded (or the browser throttled timers), don't try to "catch up".
      // We restart the cycle at the current time to keep motion consistent.
      const pausedFor = now - lastStepAtRef.current;
      if (pausedFor > maxPauseMs) {
        lastStepAtRef.current = now;
        cycleStartAtRef.current = now;
      }

      const elapsed = now - cycleStartAtRef.current;
      const progress = intervalMs > 0 ? elapsed / intervalMs : 1;

      // Only update when interval completes (once per intervalMs).
      if (progress >= 1) {
        lastStepAtRef.current = now;

        setState((prev) => {
          const prevData = prev.data;
          if (!prevData || prevData.length === 0) return prev;

          let currentData = prevData.slice();
          
          // Ensure we have exactly windowSize + 1 points.
          if (currentData.length < windowSize + 1) {
            const last = currentData[currentData.length - 1];
            const lastX = Number(last?.[xKey]);
            const nextX = (Number.isFinite(lastX) ? lastX : currentData.length - 1) + 1;
            const target = getNextTargetRef.current({ lastPoint: last, nextX });

            const nextPoint: T = { ...last, [xKey]: nextX };
            numericKeysRef.current.forEach((k) => {
              const v = (target as any)?.[k];
              (nextPoint as any)[k] = typeof v === "number" ? v : (last as any)[k];
            });

            currentData.push(nextPoint);
          }

          // Shift window: remove oldest, add new point.
          currentData.shift();

          const last = currentData[currentData.length - 1];
          const lastX = Number(last?.[xKey]);
          const nextX = (Number.isFinite(lastX) ? lastX : currentData.length) + 1;
          const target = getNextTargetRef.current({ lastPoint: last, nextX });

          const newPoint: T = { ...last, [xKey]: nextX };
          numericKeysRef.current.forEach((k) => {
            const v = (target as any)?.[k];
            (newPoint as any)[k] = typeof v === "number" ? v : (last as any)[k];
          });

          currentData.push(newPoint);

          // Reset cycle timing for the next interval.
          cycleStartAtRef.current = now - (elapsed - intervalMs);

          // Domain uses integer bounds.
          const firstX = Number(currentData[0]?.[xKey]);
          const left = Number.isFinite(firstX) ? firstX : 0;
          const right = left + windowSize;

          return {
            data: currentData,
            xDomain: [left, right],
          };
        });
      }

      rafIdRef.current = window.requestAnimationFrame(step);
    };

    rafIdRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafIdRef.current) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = null;
    };
  }, [intervalMs, running, stepMs, windowSize, xKey]);

  return {
    data: state.data,
    xDomain: state.xDomain,
    running,
    setRunning,
    reset,
  };
}
