import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { GuestsView } from "@/components/guests/guests-view";

export const metadata: Metadata = { title: "Guest list · Seatwise" };

export default function GuestsPage() {
  return (
    <AppShell>
      <GuestsView />
    </AppShell>
  );
}
