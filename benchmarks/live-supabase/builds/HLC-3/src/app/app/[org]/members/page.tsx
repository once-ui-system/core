import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEMO_MEMBERS } from "@/lib/orgs/demo";
import { getOrgPageContext } from "@/lib/orgs/access";
import { listMembers } from "@/lib/orgs/service";
import { canManage } from "@/lib/orgs/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { InviteForm } from "./InviteForm";

export const metadata: Metadata = {
  title: "Members",
  description: "The people in your organization, and invitations for new ones.",
  robots: { index: false, follow: false },
};

export default async function MembersPage({ params }: PageProps<"/app/[org]/members">) {
  const { org: slug } = await params;
  const context = await getOrgPageContext(slug);
  if (!context) notFound();
  const { org, role } = context;

  const members = isSupabaseConfigured()
    ? await listMembers(await createClient(), org.id)
    : DEMO_MEMBERS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">{members.length} in {org.name}</p>
      </div>

      <Card>
        <CardContent className="pt-4">
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
                  <TableCell className="break-all">{member.email || "No email on record"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage(role) && (
        <Card>
          <CardHeader>
            <CardTitle>Invite people</CardTitle>
            <CardDescription>
              Create a link that adds someone to this organization. Links expire after 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm slug={org.slug} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
