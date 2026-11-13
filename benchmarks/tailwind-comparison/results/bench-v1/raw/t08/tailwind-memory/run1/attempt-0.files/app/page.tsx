import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const metadata: Metadata = {
  title: "Get started · Lumen",
  description: "Set up your Lumen account and workspace in four quick steps.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <OnboardingWizard />
    </main>
  );
}
