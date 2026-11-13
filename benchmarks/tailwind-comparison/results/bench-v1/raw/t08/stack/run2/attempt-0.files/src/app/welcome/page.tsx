import type { Metadata } from "next";
import { WelcomeChecklist } from "@/components/onboarding/WelcomeChecklist";

export const metadata: Metadata = {
  title: "Welcome - Lumen",
  description: "Your Lumen workspace is ready. Here's what to do next.",
};

export default function Page() {
  return <WelcomeChecklist />;
}
