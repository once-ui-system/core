import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your profile and how Lumen contacts you.</p>
      </div>
      <SettingsForm />
    </div>
  );
}
