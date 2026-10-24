import type { Metadata } from "next";
import { getMyOrg } from "@/lib/orgs/context";
import { listMembers } from "@/lib/orgs/data";
import { DEMO_MEMBERS } from "@/lib/orgs/demo";
import { canManage } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InviteForm } from "@/components/app/forms";

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }): Promise<Metadata> {
  const { org: slug } = await params;
  return pageMetadata({ title: `Members · ${slug}`, description: "Members of your organization and invitations.", path: `/app/${slug}/members` });
}

export default async function MembersPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const org = await getMyOrg(slug);
  if (!org) return null;

  const members = isSupabaseConfigured()
    ? await listMembers(await createClient(), org.id)
    : DEMO_MEMBERS;
  const canInvite = canManage(org.role);

  return (
    <div className="flex flex-col gap-6">
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

      {canInvite ? (
        <Card>
          <CardHeader>
            <CardTitle>Invite people</CardTitle>
            <CardDescription>
              Creates a link that expires in 7 days. With an email, only that address can use it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm slug={org.slug} />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Only owners and admins can invite people.</p>
      )}
    </div>
  );
}
