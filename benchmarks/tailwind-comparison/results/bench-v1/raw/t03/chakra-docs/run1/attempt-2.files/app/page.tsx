import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = { title: "Dashboard · Lumen" };

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
