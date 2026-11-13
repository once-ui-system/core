import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { AppFrame } from "@/components/AppFrame";
import { AppStateProvider } from "@/components/AppState";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Pawpoint | Front desk, Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <ModalsProvider>
            <Notifications position="bottom-center" />
            <AppStateProvider>
              <AppFrame>{children}</AppFrame>
            </AppStateProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
