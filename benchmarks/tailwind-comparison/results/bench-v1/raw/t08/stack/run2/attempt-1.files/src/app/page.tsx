import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const metadata: Metadata = {
  title: "Get started - Lumen",
  description: "Set up your Lumen workspace in four quick steps.",
};

export default function Page() {
  return <Onboarding />;
}
