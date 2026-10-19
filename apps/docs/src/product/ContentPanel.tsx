"use client";

import { Row } from "@once-ui-system/core";
import { usePathname } from "next/navigation";

/**
 * The page content sits on its own surface, one step off the page, with the
 * sidebar left outside it on the page background: the layout the Stack
 * dashboard uses.
 *
 * The blocks routes draw their own panel, since their catalogue rail lives
 * inside `children` and belongs outside it (see `blocks/[category]/layout.tsx`).
 */
export const ContentPanel = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  if (pathname?.startsWith("/blocks")) return <Row fillWidth>{children}</Row>;
  return <Panel>{children}</Panel>;
};

export const Panel = ({ children }: { children: React.ReactNode }) => (
  <Row
    fillWidth
    background="surface"
    border="neutral-alpha-weak"
    radius="l"
    marginRight="8"
    marginBottom="8"
    m={{ marginLeft: "8" }}
  >
    {children}
  </Row>
);
