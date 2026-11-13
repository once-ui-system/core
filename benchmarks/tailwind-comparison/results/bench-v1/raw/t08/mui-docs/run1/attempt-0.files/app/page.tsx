import type { Metadata } from "next";
import OnboardingWizard from "@/components/OnboardingWizard";
import { OnboardingProvider } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Get started with Lumen",
  description:
    "Set up your Lumen account, workspace, team and preferences in four short steps.",
};

export default function Page() {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
