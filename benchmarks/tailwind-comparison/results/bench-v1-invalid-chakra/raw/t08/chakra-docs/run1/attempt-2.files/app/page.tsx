import type { Metadata } from "next"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata: Metadata = {
  title: "Get started with Lumen",
  description:
    "Set up your Lumen account, workspace, teammates and preferences in four quick steps.",
}

export default function Page() {
  return <OnboardingWizard />
}
