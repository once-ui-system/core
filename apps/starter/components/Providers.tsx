"use client";

import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DataThemeProvider>
        <ToastProvider>
          <IconProvider>
            {children}
          </IconProvider>
        </ToastProvider>
      </DataThemeProvider>
    </ThemeProvider>
  );
}