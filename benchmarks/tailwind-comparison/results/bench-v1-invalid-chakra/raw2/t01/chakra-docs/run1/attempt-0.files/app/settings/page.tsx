import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />
      <SettingsForm />
    </AppShell>
  );
}
