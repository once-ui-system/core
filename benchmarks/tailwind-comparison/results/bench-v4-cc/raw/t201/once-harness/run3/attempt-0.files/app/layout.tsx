import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, VisuallyHidden } from "@once-ui-system/core";
import { Providers } from "./providers";
import { DeskProvider } from "@/components/DeskProvider";
import { AppHeader } from "@/components/AppHeader";
import { BookingDialog } from "@/components/BookingDialog";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <DeskProvider>
            <VisuallyHidden as="a" href="#main" focusable>
              Skip to main content
            </VisuallyHidden>
            <AppHeader />
            {children}
            <BookingDialog />
          </DeskProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
