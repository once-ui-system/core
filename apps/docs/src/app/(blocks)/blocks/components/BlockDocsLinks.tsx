"use client";

import { createContext, type ReactNode, useContext } from "react";

/** Lower-cased component name → its docs route, e.g. `tiltfx` → `/effects/tiltFx`. */
export type DocsLinks = Record<string, string>;

const DocsLinksContext = createContext<DocsLinks>({});

export function BlockDocsLinksProvider({
  links,
  children,
}: {
  links: DocsLinks;
  children: ReactNode;
}) {
  return <DocsLinksContext.Provider value={links}>{children}</DocsLinksContext.Provider>;
}

export const useBlockDocsLinks = () => useContext(DocsLinksContext);
