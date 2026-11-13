import type { Metadata } from "next";
import { TeamClient } from "@/components/TeamClient";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage members, roles and invitations for your Lumen workspace.",
};

export default function Page() {
  return <TeamClient />;
}
