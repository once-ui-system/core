import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canManage, getMembership, getUser, listMembers } from "@/lib/orgs";
import { InviteForm } from "@/components/invite-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Members",
  description: "People in your organization and invitations.",
};

export default async function MembersPage({ params }: PageProps<"/app/[org]/members">) {
  const { org: slug } = await params;
  const user = await getUser();
  const org = user && (await getMembership(user.id, slug));
  if (!org) notFound();
  const members = await listMembers(org.id);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Members</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.user_id}>
              <TableCell>{m.email}</TableCell>
              <TableCell className="capitalize">{m.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {canManage(org.role) ? (
        <InviteForm org={org.slug} />
      ) : (
        <p className="text-sm text-muted-foreground">Only owners and admins can invite people.</p>
      )}
    </div>
  );
}
