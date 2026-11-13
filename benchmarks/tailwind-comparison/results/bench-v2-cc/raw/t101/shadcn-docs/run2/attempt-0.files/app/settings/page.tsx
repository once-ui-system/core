import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeading title="Settings" description="Your profile and workspace preferences." />
      <SettingsForm />
    </div>
  );
}
