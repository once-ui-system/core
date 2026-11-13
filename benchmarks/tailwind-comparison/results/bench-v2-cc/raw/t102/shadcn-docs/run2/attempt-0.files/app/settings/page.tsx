import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Make Lumen feel like home: update your profile and pick how we keep in touch."
      />
      <SettingsForm />
    </>
  );
}
