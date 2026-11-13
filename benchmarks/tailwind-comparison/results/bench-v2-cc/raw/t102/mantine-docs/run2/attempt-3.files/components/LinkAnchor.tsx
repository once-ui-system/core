"use client";

import Link from "next/link";
import { Anchor } from "@mantine/core";
import type { ReactNode } from "react";

// Client wrapper so server pages can render a Mantine Anchor that uses next/link.
export function LinkAnchor({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Anchor component={Link} href={href} fw={600}>
      {children}
    </Anchor>
  );
}
