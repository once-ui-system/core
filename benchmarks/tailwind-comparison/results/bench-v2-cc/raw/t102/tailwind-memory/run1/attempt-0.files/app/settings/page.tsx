import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Settings</h1>
        <p className="text-lg text-muted">
          Keep your profile and notifications just the way you like them.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
