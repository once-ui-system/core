"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "@mantine/core";

interface LinkButtonProps extends ButtonProps {
  href: string;
}

/**
 * A Mantine Button rendered as a Next.js Link. `component={Link}` is a
 * function, so it must be set inside a client component: server components
 * cannot pass functions as props to client components.
 */
export function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button component={Link} href={href} {...props} />;
}
