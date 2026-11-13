import { Column } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <Column gap="24" maxWidth="m">
      <PageHeader
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />
      <SettingsForm />
    </Column>
  );
}
