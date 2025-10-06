"use client";

import { DataThemeProvider, IconProvider, LayoutProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutProvider breakpoints={{xs: 420, s: 560, m: 960, l: 1280, xl: 1600}}>
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