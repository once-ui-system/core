"use client";

import { useCallback, useRef, useState } from "react";
import { type ChangeDetails, createChangeDetails } from "../utils/changeDetails.js";

/**
 * The one value contract every stateful component follows in 3.0: state `X`
 * is `X` / `defaultX` / `onXChange(next)`.
 *
 * The component is controlled when `value` is defined, never because a
 * handler was passed. Uncontrolled, it keeps its own state starting from
 * `defaultValue`. Either way `onChange` hears every change the component
 * makes, and only those: a parent changing `value` does not call it back.
 *
 * Each change reports `ChangeDetails` beside the value: its `source` comes
 * from the event passed to the setter, else the event being handled, else
 * `withChangeSource`. A callback that calls `details.cancel()` keeps an
 * uncontrolled component as it was.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (next: T, details?: ChangeDetails) => void;
}): [T, (next: T | ((prev: T) => T), event?: Event | { nativeEvent: Event }) => void] {
  const [own, setOwn] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : own;

  const latest = useRef({ current, controlled, onChange });
  latest.current = { current, controlled, onChange };

  const set = useCallback((next: T | ((prev: T) => T), event?: Event | { nativeEvent: Event }) => {
    const { current: prev, controlled: isControlled, onChange: notify } = latest.current;
    const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
    if (Object.is(resolved, prev)) return;
    // Uncontrolled, two changes in one event build on each other. Controlled,
    // the parent's `value` stays the truth: a parent that declines a change
    // (keeps `value` as it was) hears the same request again next time.
    const details = createChangeDetails(event);
    notify?.(resolved, details);
    if (!isControlled && !details.canceled) {
      setOwn(resolved);
      latest.current.current = resolved;
    }
  }, []);

  return [current, set];
}
