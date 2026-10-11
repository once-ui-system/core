"use client";

import {
  DataThemeProvider,
  IconProvider,
  ThemeProvider,
  ToastProvider,
} from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { iconLibrary } from "@/resources/icons";
import { dataStyle, style } from "@/resources/once-ui.config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider {...style}>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider s={"top"}>
            <IconProvider icons={iconLibrary}>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
