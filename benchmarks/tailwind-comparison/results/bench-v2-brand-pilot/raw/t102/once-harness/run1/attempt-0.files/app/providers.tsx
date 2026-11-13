"use client";

// Standard Once UI provider stack with the Lumen theme config applied.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { dataStyle, style } from "../lib/once-ui.config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider {...style}>
      <LayoutProvider>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
