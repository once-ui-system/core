"use client";

import { useEffect, useState } from "react";

interface MotionCapability {
  prefersReducedMotion: boolean;
  isLowEnd: boolean;
  shouldAnimate: boolean;
}

function detectLowEndDevice(): boolean {
  if (typeof window === "undefined") return false;

  const nav = navigator as any;

  // Check hardware concurrency (CPU cores)
  const cores = nav.hardwareConcurrency;
  if (typeof cores === "number" && cores <= 2) return true;

  // Check device memory (GB) — Chrome/Edge only
  const memory = nav.deviceMemory;
  if (typeof memory === "number" && memory <= 2) return true;

  return false;
}

export function useReducedMotion(
  override?: boolean | "auto",
): MotionCapability {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowEnd] = useState(() => detectLowEndDevice());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const autoShouldAnimate = !prefersReducedMotion && !isLowEnd;

  let shouldAnimate: boolean;
  if (override === true) {
    shouldAnimate = false; // force reduced
  } else if (override === false) {
    shouldAnimate = true; // force full
  } else {
    shouldAnimate = autoShouldAnimate; // auto
  }

  return { prefersReducedMotion, isLowEnd, shouldAnimate };
}
