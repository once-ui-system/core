import { Column } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <Column gap="32">
      <PageHeader
        title="Settings"
        description="Manage your profile and how Lumen contacts you."
      />
      <SettingsForm />
    </Column>
  );
}
