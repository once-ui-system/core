"use client";

// Standard Once UI provider stack with Lumen's identity set once, on the ThemeProvider.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      theme="system"
      defaultTheme="dark"
      neutral="sand"
      brand="custom"
      brandSeed="#E8590C"
      accent="custom"
      accentSeed="#E8590C"
      solid="color"
      solidStyle="flat"
      border="conservative"
      surface="filled"
      scaling="100"
      density="normal"
    >
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
