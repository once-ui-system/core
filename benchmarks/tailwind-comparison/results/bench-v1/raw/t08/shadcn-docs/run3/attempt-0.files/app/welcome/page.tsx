import type { Metadata } from "next";

import { WelcomeContent } from "@/components/onboarding/welcome-content";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here's what to do next.",
};

export default function WelcomePage() {
  return (
    <main className="min-h-dvh bg-muted/30">
      <WelcomeContent />
    </main>
  );
}
