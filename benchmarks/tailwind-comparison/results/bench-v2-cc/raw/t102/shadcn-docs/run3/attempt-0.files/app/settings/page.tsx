import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
        <p className="text-lg text-muted-foreground">Make Lumen feel like yours.</p>
      </section>
      <SettingsForm />
    </div>
  );
}
