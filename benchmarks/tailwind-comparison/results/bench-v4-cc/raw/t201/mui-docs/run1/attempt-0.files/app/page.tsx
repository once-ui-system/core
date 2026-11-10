import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ScheduleView from "@/components/ScheduleView";

export const metadata: Metadata = { title: "Today's schedule | Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <ScheduleView />
    </AppShell>
  );
}
