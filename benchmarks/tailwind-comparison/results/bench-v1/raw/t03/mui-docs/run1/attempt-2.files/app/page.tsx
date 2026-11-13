import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import DashboardView from "@/components/DashboardView";

export const metadata: Metadata = { title: "Dashboard · Lumen" };

export default function Page() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
