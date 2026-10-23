import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InviteForm } from "@/components/app/forms";
import { getAppContext } from "@/lib/orgs/context";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { listMembers, type MemberRow } from "@/lib/orgs/server";
import { canManage } from "@/lib/orgs/types";

export const metadata: Metadata = {
  title: "Members",
  description: "People in your organization and invitations.",
};

export default async function MembersPage({ params }: PageProps<"/app/[org]/members">) {
  const { org: slug } = await params;
  const { org, user } = await getAppContext(slug);
  const members: MemberRow[] = isSupabaseConfigured()
    ? await listMembers(org.id)
    : [{ user_id: user.id, email: user.email, role: "owner" }];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Members</h1>
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>
      {canManage(org.role) && (
        <Card>
          <CardHeader>
            <CardTitle>Invite people</CardTitle>
            <CardDescription>Share the link with them. It expires after 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm org={org.slug} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
