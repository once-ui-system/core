import type { Metadata } from "next";
import { Column } from "@once-ui-system/core";
import { AppHeader } from "@/components/AppHeader";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = {
  title: "Today's schedule | Pawpoint",
  description: "Front desk schedule for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <Column fillWidth minHeight="100vh">
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth maxWidth="80rem">
          <Schedule />
        </Column>
      </Column>
    </Column>
  );
}
