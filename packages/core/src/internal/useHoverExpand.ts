"use client";

import type React from "react";
import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/** Hover intent: a pointer crossing the rail on its way to the page does not open it. */
const OPEN_DELAY = 150;
/** Grace period, so overshooting the open edge by a few pixels does not snap it shut. */
const CLOSE_DELAY = 200;

export type HoverHandlers<T extends HTMLElement = HTMLElement> = Pick<
  React.HTMLAttributes<T>,
  "onPointerEnter" | "onPointerLeave" | "onFocus" | "onBlur" | "onKeyDown"
>;

/** `:focus-visible` is the keyboard's focus; a click focuses a row too, and must not pin the Nav open. */
const isKeyboardFocus = (el: Element) => {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
};

/**
 * Open on a resting mouse or on keyboard focus, close on leave, blur or
 * Escape. The host's own handlers still run.
 */
export function useHoverExpand<T extends HTMLElement = HTMLElement>(
  enabled: boolean,
  own: HoverHandlers<T>,
) {
  const [expanded, setExpanded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const schedule = (next: boolean, delay: number) => {
    cancel();
    timer.current = setTimeout(() => setExpanded(next), delay);
  };
  useEffect(() => cancel, [cancel]);
  useEffect(() => {
    if (!enabled) {
      cancel();
      setExpanded(false);
    }
  }, [enabled, cancel]);

  if (!enabled) return { expanded: false, handlers: {} as HoverHandlers<T> };

  const handlers: HoverHandlers<T> = {
    onPointerEnter: (event: PointerEvent<T>) => {
      own.onPointerEnter?.(event);
      if (event.pointerType === "mouse") schedule(true, OPEN_DELAY);
    },
    onPointerLeave: (event: PointerEvent<T>) => {
      own.onPointerLeave?.(event);
      if (event.pointerType === "mouse") schedule(false, CLOSE_DELAY);
    },
    onFocus: (event: FocusEvent<T>) => {
      own.onFocus?.(event);
      if (isKeyboardFocus(event.target)) {
        cancel();
        setExpanded(true);
      }
    },
    onBlur: (event: FocusEvent<T>) => {
      own.onBlur?.(event);
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        cancel();
        setExpanded(false);
      }
    },
    onKeyDown: (event: KeyboardEvent<T>) => {
      own.onKeyDown?.(event);
      if (event.key === "Escape") {
        cancel();
        setExpanded(false);
      }
    },
  };
  return { expanded, handlers };
}
