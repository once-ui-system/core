import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { AppHeader } from "@/components/AppHeader";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Pawpoint — Hillside Veterinary Clinic front desk",
  description: "Front-desk schedule, check-in and patient records for Hillside Veterinary Clinic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </Column>
    </Flex>
  );
}
