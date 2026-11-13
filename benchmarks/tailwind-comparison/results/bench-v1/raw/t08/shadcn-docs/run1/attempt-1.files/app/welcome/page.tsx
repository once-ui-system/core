import type { Metadata } from "next";
import { WelcomeContent } from "@/components/welcome-content";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here are your next steps.",
};

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <WelcomeContent />
    </main>
  );
}
