"use client";

// Standard Once UI provider stack, carrying Lumen's identity through ThemeProvider:
// brand #DB2777, warm sand neutrals, rounded corners, airy density, light by default.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      defaultTheme="light"
      brand="custom"
      brandSeed="#DB2777"
      accent="custom"
      accentSeed="#DB2777"
      neutral="sand"
      solid="color"
      border="rounded"
      density="spacious"
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
