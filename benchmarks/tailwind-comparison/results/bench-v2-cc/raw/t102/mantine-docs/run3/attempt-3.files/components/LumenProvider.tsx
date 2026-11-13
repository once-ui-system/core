"use client";

import { MantineProvider } from "@mantine/core";
import { cssVariablesResolver, theme } from "@/app/theme";

export function LumenProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
      cssVariablesResolver={cssVariablesResolver}
    >
      {children}
    </MantineProvider>
  );
}
