"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** What the toolbar says about saving. */
export type SaveState = "saved" | "saving" | "unsaved" | "error";

/** How long after the last change a save starts. */
export const AUTOSAVE_MS = 600;

/**
 * Saves `value` a short while after it last changed, one save at a time.
 *
 * A change made while a save is running is saved right after it. A failed save
 * keeps the value and says so; the next change, or `retry`, tries again.
 * When `resetKey` changes (another page opened) the value at that moment
 * counts as saved, so loading never counts as a change. Call `flush` before
 * changing it, so the page being left is saved first.
 */
export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  { delay = AUTOSAVE_MS, resetKey }: { delay?: number; resetKey?: string } = {},
) {
  const [state, setState] = useState<SaveState>("saved");
  const saved = useRef(value);
  const running = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetKey = useRef(resetKey);
  const latest = useRef({ value, save });
  latest.current = { value, save };

  const flush = useCallback(async (): Promise<void> => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (running.current) await running.current;
    const { value: next, save: write } = latest.current;
    if (Object.is(next, saved.current)) {
      setState("saved");
      return;
    }
    setState("saving");
    const attempt = (async () => {
      try {
        await write(next);
        saved.current = next;
        setState(Object.is(latest.current.value, next) ? "saved" : "unsaved");
      } catch {
        setState("error");
      }
    })();
    running.current = attempt;
    await attempt;
    running.current = null;
    // Changed while saving: save that too.
    if (!Object.is(latest.current.value, saved.current) && timer.current === null) {
      timer.current = setTimeout(() => {
        timer.current = null;
        void flush();
      }, delay);
    }
  }, [delay]);

  useEffect(() => {
    if (resetKey !== lastResetKey.current) {
      lastResetKey.current = resetKey;
      saved.current = value;
      setState("saved");
      return;
    }
    if (Object.is(value, saved.current)) return;
    setState((current) => (current === "error" ? current : "unsaved"));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      void flush();
    }, delay);
  }, [value, resetKey, delay, flush]);

  // Leaving with a change not yet saved asks first.
  useEffect(() => {
    if (state === "saved") return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { state, flush, retry: flush };
}
