import type { Metadata } from "next";
import TeamPage from "@/components/TeamPage";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage the members of your Lumen workspace.",
};

export default function Page() {
  return <TeamPage />;
}
