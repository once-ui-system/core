import type { Metadata } from "next";
import { PageHeading } from "@/components/ui";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeading title="Settings">Update your profile and choose what Lumen tells you about.</PageHeading>
      <SettingsForm />
    </>
  );
}
