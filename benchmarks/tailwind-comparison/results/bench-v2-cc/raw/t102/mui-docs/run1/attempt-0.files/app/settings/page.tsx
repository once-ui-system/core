import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Update your profile, pick a look you like and choose what lands in your inbox."
      />
      <SettingsForm />
    </>
  );
}
