"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * A callback ref that puts a scroll container in the tab order only while its
 * content overflows, so a keyboard can scroll it (axe:
 * scrollable-region-focusable) without adding a tab stop to every container
 * that happens to fit. A `tabindex` the caller set is left alone.
 */
export function useScrollableTabStop<T extends HTMLElement>(
  forwardedRef?: React.Ref<T>,
): (node: T | null) => void {
  const observer = useRef<ResizeObserver | null>(null);

  useEffect(() => () => observer.current?.disconnect(), []);

  return useCallback(
    (node: T | null) => {
      observer.current?.disconnect();
      observer.current = null;

      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef && "current" in forwardedRef) {
        (forwardedRef as React.MutableRefObject<T | null>).current = node;
      }

      if (!node || typeof ResizeObserver === "undefined") return;
      const callerTabIndex = node.getAttribute("tabindex");
      if (callerTabIndex !== null && callerTabIndex !== "-1") return;

      const update = () => {
        const overflows =
          node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1;
        if (overflows) node.setAttribute("tabindex", "0");
        else if (callerTabIndex === null) node.removeAttribute("tabindex");
        else node.setAttribute("tabindex", callerTabIndex);
      };
      update();
      observer.current = new ResizeObserver(update);
      observer.current.observe(node);
      for (const child of Array.from(node.children)) observer.current.observe(child);
    },
    [forwardedRef],
  );
}
