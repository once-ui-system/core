"use client";

import { useLayoutEffect, useState } from "react";

/**
 * The look an overlay should keep when it portals to `document.body`.
 *
 * A StyleScope (or a `data-theme` / `data-brand` set on a section) styles its
 * subtree through attribute selectors. A Drawer or a header menu rendered in
 * a portal leaves that subtree, so it fell back to the page's look: a branded
 * app's phone drawer drew its mark, buttons and meters unstyled. Copying the
 * nearest scope's `data-*` attributes onto the portal's root puts it back
 * under the same selectors.
 */
export function useScopeAttributes(
  marker: React.RefObject<HTMLElement | null>,
  active: boolean,
): Record<string, string> {
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    if (!active) return;
    setAttributes(readScopeAttributes(marker.current));
  }, [active, marker]);
  return attributes;
}

export function readScopeAttributes(node: HTMLElement | null): Record<string, string> {
  const out: Record<string, string> = {};
  // The nearest element that sets a look, below <body> (the page's own look
  // already reaches the portal). Theme and brand set further out still count.
  for (
    let element = node?.parentElement ?? null;
    element && element !== document.body && element !== document.documentElement;
    element = element.parentElement
  ) {
    const scoped = element.hasAttribute("data-style-scope");
    for (const { name, value } of Array.from(element.attributes)) {
      if (!name.startsWith("data-") || name in out) continue;
      if (scoped || name === "data-theme" || name === "data-brand" || name === "data-accent") {
        out[name] = value;
      }
    }
    if (scoped) break;
  }
  return out;
}
