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
import { PlanProvider } from "@/components/PlanProvider";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Seatwise: Ines & Mateo's wedding dinner",
  description: "Seating planner for wedding and event planners.",
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
            <Notifications />
            <PlanProvider>
              <AppFrame>{children}</AppFrame>
            </PlanProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
