"use client";

import * as React from "react";
import NextLink from "next/link";
import Button from "@mui/material/Button";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
}

export default function LinkButton({
  href,
  children,
  variant = "text",
  size = "medium",
}: LinkButtonProps) {
  return (
    <Button component={NextLink} href={href} variant={variant} size={size}>
      {children}
    </Button>
  );
}
