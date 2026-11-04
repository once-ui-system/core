import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard · Lumen",
  description: "A summary of your Lumen workspace.",
};

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
