import { SettingsForm } from "@/components/settings-form";
import { PageHeading } from "@/components/page-heading";

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />
      <SettingsForm />
    </>
  );
}
