"use client";

// Standard Once UI provider stack (mirrors the official Next.js starter):
// theme, Next-aware links/images, chart theme, toasts, icons.
// Lumen's identity is passed to ThemeProvider once, from lib/theme.ts.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { style } from "../lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider {...style}>
      <LayoutProvider>
        <DataThemeProvider>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
