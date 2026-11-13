import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";

export const metadata = {
  title: "Overview · Lumen",
  description: "A summary of your team's projects and issues in Lumen.",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
