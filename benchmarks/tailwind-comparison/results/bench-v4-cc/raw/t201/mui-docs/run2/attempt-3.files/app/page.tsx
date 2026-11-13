import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ScheduleBoard } from "@/components/ScheduleBoard";

export const metadata: Metadata = { title: "Today's schedule · Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <ScheduleBoard />
    </AppShell>
  );
}
