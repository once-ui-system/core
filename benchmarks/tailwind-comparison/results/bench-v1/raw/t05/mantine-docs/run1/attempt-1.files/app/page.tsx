import type { Metadata } from "next";
import { TeamView } from "@/components/team-view";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage who has access to Lumen, your product analytics and issue tracker.",
};

export default function Page() {
  return (
    <main>
      <TeamView />
    </main>
  );
}
