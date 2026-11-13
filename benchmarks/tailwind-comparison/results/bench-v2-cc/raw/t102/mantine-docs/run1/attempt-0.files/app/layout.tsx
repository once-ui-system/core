import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { AppShellFrame } from "@/components/app-shell-frame";
import { cssVariablesResolver, theme } from "./theme";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Lumen: product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider
          theme={theme}
          defaultColorScheme="light"
          cssVariablesResolver={cssVariablesResolver}
        >
          <ModalsProvider>
            <Notifications position="top-right" />
            <AppShellFrame>{children}</AppShellFrame>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
