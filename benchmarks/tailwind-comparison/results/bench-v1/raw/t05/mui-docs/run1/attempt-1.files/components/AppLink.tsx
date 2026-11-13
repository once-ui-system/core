"use client";

import NextLink from "next/link";
import MuiLink from "@mui/material/Link";
import type { LinkProps as MuiLinkProps } from "@mui/material/Link";

interface AppLinkProps extends Omit<MuiLinkProps, "href" | "component"> {
  href: string;
}

export default function AppLink({ href, children, ...rest }: AppLinkProps) {
  return (
    <MuiLink component={NextLink} href={href} {...rest}>
      {children}
    </MuiLink>
  );
}
