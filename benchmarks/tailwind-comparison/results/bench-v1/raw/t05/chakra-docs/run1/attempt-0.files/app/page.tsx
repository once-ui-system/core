import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { TeamPage } from "@/components/team-page";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage the members of your Lumen workspace.",
};

export default function Page() {
  return (
    <AppShell>
      <TeamPage />
    </AppShell>
  );
}
