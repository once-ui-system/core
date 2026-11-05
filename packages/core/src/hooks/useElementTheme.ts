"use client";

import { type RefObject, useEffect, useLayoutEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeProvider.js";

type ResolvedTheme = "light" | "dark";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The theme `element` is drawn in: its nearest `data-theme="light"` or
 * `"dark"`, flipped once for every `data-theme="invert"` between them.
 * `fallback` (the page's resolved theme) answers when no ancestor has one.
 *
 * The stylesheet resolves a nested or inverted theme on its own; this is for
 * code that picks a look in JavaScript, such as a map's tile style.
 */
export function elementTheme(element: Element | null, fallback: ResolvedTheme): ResolvedTheme {
  let flips = 0;
  let base: ResolvedTheme = fallback;
  for (let node = element; node; node = node.parentElement) {
    const theme = node.getAttribute("data-theme");
    if (theme === "invert") flips += 1;
    else if (theme === "light" || theme === "dark") {
      base = theme;
      break;
    }
  }
  if (flips % 2 === 0) return base;
  return base === "dark" ? "light" : "dark";
}

/**
 * `useTheme().resolvedTheme`, but for the subtree `ref` sits in: a map in a
 * `theme="dark"` section of a light page, or under `theme="invert"`, gets
 * `"dark"`. It follows the page's theme and any `data-theme` changed above
 * it. Before the element mounts (and on the server) it is the page's theme.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const theme = useElementTheme(ref);
 */
export function useElementTheme(ref: RefObject<Element | null>): ResolvedTheme {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState<ResolvedTheme>(resolvedTheme);

  useIsomorphicLayoutEffect(() => {
    const update = () => setTheme(elementTheme(ref.current, resolvedTheme));
    update();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
      subtree: true,
    });
    return () => observer.disconnect();
  }, [ref, resolvedTheme]);

  return theme;
}
