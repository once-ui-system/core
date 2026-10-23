import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteForm } from "@/components/app/invite-form";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { canManage, getOrgContext, getSessionUser, listMembers } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Members",
  description: "People in your organization and invitations.",
};

export default async function MembersPage({ params }: { params: Promise<{ org: string }> }) {
  const user = await getSessionUser();
  const ctx = user && (await getOrgContext((await params).org, user.id));
  if (!ctx) notFound();
  const members = await listMembers(ctx.org.id);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Members</h1>
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
              <TableCell><Badge variant="secondary">{m.role}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {canManage(ctx.role) ? (
        <section className="max-w-md space-y-3">
          <h2 className="text-lg font-semibold">Invite people</h2>
          <InviteForm slug={ctx.org.slug} />
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">Only admins and owners can invite people.</p>
      )}
    </div>
  );
}
