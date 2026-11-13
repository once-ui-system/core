import type { Metadata } from "next";

import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and how Lumen keeps you informed.</p>
      </div>
      <SettingsForm />
    </>
  );
}
