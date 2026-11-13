import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SettingsPanel } from "@/components/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings · Lumen",
  description: "Profile and notification settings for your Lumen account.",
};

export default function Page() {
  return (
    <AppShell>
      <SettingsPanel />
    </AppShell>
  );
}
