import type { Metadata } from "next";

import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and how Lumen keeps you informed.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
