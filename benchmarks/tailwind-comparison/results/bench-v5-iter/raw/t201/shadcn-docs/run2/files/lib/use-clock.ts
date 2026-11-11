"use client";

import { useEffect, useState } from "react";
import { clockStart } from "@/lib/data";
import { toMin } from "@/lib/schedule";

/**
 * The desk clock, in minutes since midnight. It starts at `clockStart` (so the
 * server and the first client render agree) and then keeps real time from there.
 */
export function useClock(): number {
  const [now, setNow] = useState(toMin(clockStart));

  useEffect(() => {
    const startedAt = Date.now();
    const base = toMin(clockStart);
    const id = window.setInterval(() => {
      setNow(base + Math.floor((Date.now() - startedAt) / 60_000));
    }, 10_000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}
