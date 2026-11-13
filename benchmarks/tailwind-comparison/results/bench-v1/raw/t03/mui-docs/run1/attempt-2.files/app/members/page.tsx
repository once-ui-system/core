import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import MembersView from "@/components/MembersView";

export const metadata: Metadata = { title: "Members · Lumen" };

export default function MembersPage() {
  return (
    <AppShell>
      <MembersView />
    </AppShell>
  );
}
