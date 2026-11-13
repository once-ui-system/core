import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import { ThemeInit } from "@once-ui-system/core/components/ThemeInit";
import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { style } from "../lib/theme";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme and the brand scheme before first paint. */}
        <ThemeInit config={style} />
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: "100vh" }}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
