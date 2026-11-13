import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Keep your profile up to date and pick the updates you want to hear about.
        </p>
      </header>
      <SettingsForm />
    </div>
  );
}
