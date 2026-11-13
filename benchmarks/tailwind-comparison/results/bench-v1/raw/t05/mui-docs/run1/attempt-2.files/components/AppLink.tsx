"use client";

import * as React from "react";
import NextLink from "next/link";
import MuiLink from "@mui/material/Link";

interface AppLinkProps {
  href: string;
  children: React.ReactNode;
  underline?: "none" | "hover" | "always";
  color?: string;
  fontWeight?: number;
}

export default function AppLink({
  href,
  children,
  underline = "always",
  color,
  fontWeight,
}: AppLinkProps) {
  return (
    <MuiLink
      component={NextLink}
      href={href}
      underline={underline}
      sx={{ color: color ?? undefined, fontWeight }}
    >
      {children}
    </MuiLink>
  );
}
