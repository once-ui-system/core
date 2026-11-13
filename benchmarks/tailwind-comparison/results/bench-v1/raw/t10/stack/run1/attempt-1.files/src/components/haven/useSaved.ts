"use client";

import { useCallback, useState } from "react";

/** Saved homes, kept in memory for the session (no storage, no backend). */
export function useSaved() {
  const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());
  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  return { saved, toggle };
}
