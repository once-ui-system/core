import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Schedule from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule | Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <Schedule />
    </AppShell>
  );
}
