import type { Metadata } from "next";
import { TeamPage } from "@/components/team-page";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage who has access to your Lumen workspace.",
};

export default function Page() {
  return <TeamPage />;
}
