import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = { title: "Dashboard · Lumen" };

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
