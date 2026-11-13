import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { AppShell } from "@/components/AppShell";
import { PlanProvider } from "@/lib/plan";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "Seating planner for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <PlanProvider>
            <AppShell>{children}</AppShell>
          </PlanProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
