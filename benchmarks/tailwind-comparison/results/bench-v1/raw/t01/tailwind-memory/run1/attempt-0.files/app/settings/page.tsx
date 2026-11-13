import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";
import { user } from "@/lib/data";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeading title="Settings" description="Manage your profile and notification preferences." />
      <SettingsForm name={user.name} email={user.email} role={user.role} />
    </AppShell>
  );
}
