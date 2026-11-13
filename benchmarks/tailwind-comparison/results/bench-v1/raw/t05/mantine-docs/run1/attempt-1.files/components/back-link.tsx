"use client";

import Link from "next/link";
import { Anchor } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Anchor component={Link} href={href} size="sm" c="dimmed">
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <IconArrowLeft size={16} aria-hidden="true" />
        {children}
      </span>
    </Anchor>
  );
}
