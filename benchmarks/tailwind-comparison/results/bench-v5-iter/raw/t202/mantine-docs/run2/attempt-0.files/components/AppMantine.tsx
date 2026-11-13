"use client";

import type { ReactNode } from "react";
import { MantineProvider, type CSSVariablesResolver } from "@mantine/core";
import { theme } from "@/app/theme";

// Mantine's default dimmed grey is too pale on the page background; darken it for AA contrast.
const resolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { "--mantine-color-dimmed": "var(--mantine-color-gray-7)" },
  dark: { "--mantine-color-dimmed": "var(--mantine-color-dark-1)" },
});

export function AppMantine({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={resolver}>
      {children}
    </MantineProvider>
  );
}
