import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Schedule } from "@/components/schedule";

export const metadata: Metadata = { title: "Today’s schedule · Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <Schedule />
    </AppShell>
  );
}
