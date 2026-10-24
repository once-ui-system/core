import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteForm } from "@/components/app/OrgForms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orgAccessFor } from "@/lib/app-context";
import { listMembers } from "@/lib/orgs/queries";
import { canManage, roleLabel } from "@/lib/orgs/types";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Members",
  description: "Members of your organization and invitations.",
});

export default async function MembersPage({ params }: PageProps<"/app/[org]/members">) {
  const { org: slug } = await params;
  const access = await orgAccessFor(slug);
  if (!access) notFound();
  const members = await listMembers(access.org.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">{access.org.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
          <CardDescription>{members.length} in this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleLabel[member.role]}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage(access.role) && (
        <Card>
          <CardHeader>
            <CardTitle>Invite people</CardTitle>
            <CardDescription>Create a link. Anyone who opens it within 7 days can join with the role you pick.</CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm slug={access.org.slug} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
