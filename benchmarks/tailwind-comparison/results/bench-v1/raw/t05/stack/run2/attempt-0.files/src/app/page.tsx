import { TeamShell } from "@/components/team/TeamShell";
import { MembersTable } from "@/components/team/MembersTable";

export const metadata = {
  title: "Team · Lumen",
  description:
    "Manage the people in your Lumen workspace: roles, invitations and access for your software team.",
};

export default function Page() {
  return (
    <TeamShell>
      <MembersTable />
    </TeamShell>
  );
}
