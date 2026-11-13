import type { Metadata } from "next";
import { TeamPage } from "@/components/members/team-page";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage members, roles and invitations in your Lumen workspace.",
};

export default function Page() {
  return <TeamPage />;
}
