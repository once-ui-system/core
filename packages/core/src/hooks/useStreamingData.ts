"use client";

import React from "react";

type NumericKeys<T> = Array<Extract<keyof T, string>>;

type StreamingTarget<T> = Partial<Record<Extract<keyof T, string>, number>>;

type StreamingOptions<T extends Record<string, any>> = {
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

type StreamingResult<T> = {
  data: T[];
  running: boolean;
  setRunning: React.Dispatch<React.SetStateAction<boolean>>;
  reset: () => void;
};

export function useStreamingData<T extends Record<string, any>>(
  options: StreamingOptions<T>,
): StreamingResult<T> {
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
  const [data, setData] = React.useState<T[]>(() => initialData.slice(-windowSize));

  const rafIdRef = React.useRef<number | null>(null);
  const lastStepAtRef = React.useRef<number>(0);
  const cycleStartAtRef = React.useRef<number>(0);
  const cycleFromRef = React.useRef<T | null>(null);
  const cycleToRef = React.useRef<StreamingTarget<T> | null>(null);
  const hasInProgressPointRef = React.useRef<boolean>(false);

  const reset = React.useCallback(() => {
    const next = initialDataRef.current.slice(-windowSize);
    setData(next);
    cycleFromRef.current = null;
    cycleToRef.current = null;
    cycleStartAtRef.current = 0;
    lastStepAtRef.current = 0;
    hasInProgressPointRef.current = false;
  }, [windowSize]);

  React.useEffect(() => {
    if (!running) return;

    const step = (now: number) => {
      if (!lastStepAtRef.current) lastStepAtRef.current = now;
      if (!cycleStartAtRef.current) cycleStartAtRef.current = now;

      const shouldStep = now - lastStepAtRef.current >= stepMs;
      const cycleElapsed = now - cycleStartAtRef.current;
      const cycleProgress = intervalMs > 0 ? Math.min(1, cycleElapsed / intervalMs) : 1;

      if (shouldStep) {
        lastStepAtRef.current = now;

        setData((prev) => {
          if (!prev || prev.length === 0) return prev;

          const lastPoint = prev[prev.length - 1];
          const lastXRaw = lastPoint[xKey];
          const lastX = typeof lastXRaw === "number" ? lastXRaw : Number(lastXRaw);

          const shouldStartNewCycle =
            !cycleFromRef.current || !hasInProgressPointRef.current || cycleElapsed >= intervalMs;

          let nextData = prev;

          if (shouldStartNewCycle) {
            const nextX = Number.isFinite(lastX) ? lastX + 1 : prev.length;

            cycleFromRef.current = lastPoint;
            cycleToRef.current = getNextTarget({ lastPoint, nextX });
            cycleStartAtRef.current = now;
            hasInProgressPointRef.current = true;

            const newPoint: T = { ...lastPoint, [xKey]: nextX };
            numericKeys.forEach((k) => {
              const fromVal = typeof lastPoint[k] === "number" ? (lastPoint[k] as number) : Number(lastPoint[k]);
              (newPoint as any)[k] = fromVal;
            });

            nextData = [...prev, newPoint].slice(-windowSize);
          }

          if (!nextData || nextData.length === 0) return nextData;

          const currentLast = nextData[nextData.length - 1];
          const from = cycleFromRef.current || currentLast;
          const to = cycleToRef.current;

          const updatedLast: T = { ...currentLast };
          numericKeys.forEach((k) => {
            const fromVal = typeof from[k] === "number" ? (from[k] as number) : Number(from[k]);
            const toCandidate = (to as any)?.[k];
            const toVal = typeof toCandidate === "number" ? (toCandidate as number) : fromVal;
            const v = fromVal + (toVal - fromVal) * cycleProgress;
            (updatedLast as any)[k] = v;
          });

          const out = nextData.slice(0, -1).concat(updatedLast);
          return out;
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
  }, [getNextTarget, intervalMs, numericKeys, running, stepMs, windowSize, xKey]);

  return { data, running, setRunning, reset };
}
