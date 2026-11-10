"use client";

// Standard Once UI provider stack, with Lumen's identity set on the ThemeProvider
// so every screen follows it: brand #0F766E, cool slate neutrals, compact density,
// light by default, restrained (conservative) corners.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      theme="system"
      defaultTheme="light"
      brand="custom"
      brandSeed="#0F766E"
      neutral="slate"
      solid="color"
      solidStyle="flat"
      border="conservative"
      surface="filled"
      density="compact"
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
