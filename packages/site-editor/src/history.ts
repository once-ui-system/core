"use client";

import { useCallback, useMemo, useRef, useState } from "react";

// Undo and redo over any value. Kept apart from React so it is tested on its
// own; `useHistory` is the thin hook the editor uses.

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
  /** The key of the last step and when it was taken, for coalescing. */
  lastKey?: string;
  lastAt?: number;
}

/** How long a run of changes with one key counts as a single step. */
export const COALESCE_MS = 1000;
/** Steps kept; older ones drop off the bottom. */
export const HISTORY_LIMIT = 200;

export const createHistory = <T>(present: T): HistoryState<T> => ({
  past: [],
  present,
  future: [],
});

/**
 * Record `next` as a new step. With a `key` equal to the last step's, taken
 * within `COALESCE_MS`, it replaces that step instead: one undo per pause.
 */
export function record<T>(
  state: HistoryState<T>,
  next: T,
  key?: string,
  now: number = Date.now(),
): HistoryState<T> {
  if (Object.is(next, state.present)) return state;
  const merge =
    key !== undefined &&
    key === state.lastKey &&
    state.lastAt !== undefined &&
    now - state.lastAt < COALESCE_MS;
  if (merge) return { ...state, present: next, future: [], lastAt: now };
  const past = [...state.past, state.present].slice(-HISTORY_LIMIT);
  return { past, present: next, future: [], lastKey: key, lastAt: now };
}

export function undo<T>(state: HistoryState<T>): HistoryState<T> {
  const previous = state.past[state.past.length - 1];
  if (state.past.length === 0) return state;
  return {
    past: state.past.slice(0, -1),
    present: previous as T,
    future: [state.present, ...state.future],
  };
}

export function redo<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.future.length === 0) return state;
  const [next, ...future] = state.future;
  return { past: [...state.past, state.present], present: next as T, future };
}

export interface History<T> {
  value: T;
  /** Take a step. Pass a function to build on the latest value. */
  set: (next: T | ((current: T) => T), key?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Start over from `value`, with no steps to undo (opening another page). */
  reset: (value: T) => void;
}

export function useHistory<T>(initial: T): History<T> {
  const [state, setState] = useState(() => createHistory(initial));
  // Read by `set`'s function form, so two calls in one event build on each other.
  const latest = useRef(state);
  latest.current = state;

  const commit = useCallback((next: HistoryState<T>) => {
    latest.current = next;
    setState(next);
  }, []);

  const set = useCallback(
    (next: T | ((current: T) => T), key?: string) => {
      const current = latest.current;
      const value =
        typeof next === "function" ? (next as (current: T) => T)(current.present) : next;
      commit(record(current, value, key));
    },
    [commit],
  );

  return useMemo(
    () => ({
      value: state.present,
      set,
      undo: () => commit(undo(latest.current)),
      redo: () => commit(redo(latest.current)),
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      reset: (value: T) => commit(createHistory(value)),
    }),
    [state, set, commit],
  );
}
