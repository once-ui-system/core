import type { Metadata } from "next";
import { Onboarding } from "@/components/Onboarding";

export const metadata: Metadata = {
  title: "Get started · Lumen",
  description: "Set up your Lumen account and workspace in four quick steps.",
};

export default function Page() {
  return (
    <main>
      <Onboarding />
    </main>
  );
}
