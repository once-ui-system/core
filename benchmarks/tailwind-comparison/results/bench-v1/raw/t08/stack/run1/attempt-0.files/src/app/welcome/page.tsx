import type { Metadata } from "next";
import { WelcomeView } from "@/components/onboarding/WelcomeView";

export const metadata: Metadata = {
  title: "Welcome - Lumen",
  description: "Your Lumen workspace is ready. Here is what to do next.",
};

export default function Page() {
  return <WelcomeView />;
}
