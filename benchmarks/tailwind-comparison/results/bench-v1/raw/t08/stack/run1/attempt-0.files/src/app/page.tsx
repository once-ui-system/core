import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Get started - Lumen",
  description: "Set up your Lumen account, workspace, team and preferences in four short steps.",
};

export default function Page() {
  return <OnboardingWizard />;
}
