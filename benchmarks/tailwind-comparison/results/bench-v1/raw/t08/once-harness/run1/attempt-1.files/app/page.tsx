import type { Metadata } from "next";
import { Onboarding } from "@/components/Onboarding";

export const metadata: Metadata = {
  title: "Get started · Lumen",
  description: "Set up your Lumen account, workspace, team and preferences.",
};

export default function Page() {
  return <Onboarding />;
}
