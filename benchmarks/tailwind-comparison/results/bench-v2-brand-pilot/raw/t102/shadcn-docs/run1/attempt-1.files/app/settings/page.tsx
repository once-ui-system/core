import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Settings"
        description="Tune your profile and notifications. Changes only affect your own account."
      />
      <SettingsForm />
    </>
  );
}
