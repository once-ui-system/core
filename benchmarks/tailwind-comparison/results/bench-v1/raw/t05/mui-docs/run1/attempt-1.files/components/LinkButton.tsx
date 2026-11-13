"use client";

import NextLink from "next/link";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";

interface LinkButtonProps extends Omit<ButtonProps, "href" | "component"> {
  href: string;
}

export default function LinkButton({ href, children, ...rest }: LinkButtonProps) {
  return (
    <Button component={NextLink} href={href} {...rest}>
      {children}
    </Button>
  );
}
