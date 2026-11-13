import type { Metadata } from "next";
import { WelcomeContent } from "@/components/WelcomeContent";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here's what to do next.",
};

export default function WelcomePage() {
  return (
    <main>
      <WelcomeContent />
    </main>
  );
}
