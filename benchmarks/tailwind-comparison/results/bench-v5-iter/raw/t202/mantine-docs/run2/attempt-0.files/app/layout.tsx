import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { PlanProvider } from "@/components/PlanProvider";
import { Shell } from "@/components/Shell";
import { AppMantine } from "@/components/AppMantine";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "A seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <AppMantine>
          <ModalsProvider>
            <Notifications />
            <PlanProvider>
              <Shell>{children}</Shell>
            </PlanProvider>
          </ModalsProvider>
        </AppMantine>
      </body>
    </html>
  );
}
