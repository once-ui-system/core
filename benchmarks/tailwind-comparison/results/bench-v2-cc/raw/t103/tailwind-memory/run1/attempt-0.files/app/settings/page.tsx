import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeading title="Settings" description="Manage your profile and how Lumen contacts you." />
      <div className="max-w-3xl">
        <SettingsForm />
      </div>
    </>
  );
}
