import type { Metadata } from "next";
import WelcomeContent from "@/components/WelcomeContent";
import { OnboardingProvider } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Welcome to Lumen",
  description: "Your Lumen workspace is ready. Here are your next steps.",
};

export default function WelcomePage() {
  return (
    <OnboardingProvider>
      <WelcomeContent />
    </OnboardingProvider>
  );
}
