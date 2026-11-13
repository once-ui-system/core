import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { PlanProvider } from "@/components/PlanProvider";
import { Shell } from "@/components/Shell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "A seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <PlanProvider>
            <Shell>{children}</Shell>
          </PlanProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
