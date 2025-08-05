"use client";

import { DataThemeProvider, IconProvider, LayoutProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <DataThemeProvider>
          <ToastProvider>
            <IconProvider>
              {children}
            </IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}