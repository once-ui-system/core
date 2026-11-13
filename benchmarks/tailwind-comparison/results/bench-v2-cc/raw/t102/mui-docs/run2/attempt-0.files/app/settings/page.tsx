import PageHeader from "@/components/PageHeader";
import SettingsForm from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Update your profile, pick a look you like and choose what we tell you about."
      />
      <SettingsForm />
    </>
  );
}
