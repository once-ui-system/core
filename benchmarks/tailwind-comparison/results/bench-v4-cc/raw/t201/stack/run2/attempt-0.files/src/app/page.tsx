import type { Metadata } from "next";
import { Column } from "@once-ui-system/core";
import { AppHeader, SkipLink } from "@/components/pawpoint/AppHeader";
import { ScheduleClient } from "@/components/pawpoint/ScheduleClient";

export const metadata: Metadata = {
  title: "Today's schedule | Pawpoint",
  description: "Front desk schedule, check-in and waiting room for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <Column fillWidth horizontal="center">
      <SkipLink />
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center">
        <ScheduleClient />
      </Column>
    </Column>
  );
}
