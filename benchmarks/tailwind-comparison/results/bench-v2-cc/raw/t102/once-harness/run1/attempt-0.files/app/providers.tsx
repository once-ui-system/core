"use client";

// Lumen's identity lives here, in the design system's own ThemeProvider:
// brand #DB2777 (primary buttons, current nav item, links, focus rings),
// warm sand neutrals, the roundest corner style, light by default, airy density.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider
        theme="system"
        defaultTheme="light"
        brand="custom"
        brandSeed="#DB2777"
        accent="orange"
        neutral="sand"
        solid="color"
        solidStyle="flat"
        border="rounded"
        surface="filled"
        density="spacious"
        transition="all"
      >
        <DataThemeProvider>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
