import type { Metadata } from "next";
import { getMyOrg } from "@/lib/orgs/context";
import { countPendingInvitations, listMembers } from "@/lib/orgs/data";
import { DEMO_MEMBERS, DEMO_STATS } from "@/lib/orgs/demo";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }): Promise<Metadata> {
  const { org: slug } = await params;
  return pageMetadata({ title: `Dashboard · ${slug}`, description: "Overview of your organization.", path: `/app/${slug}` });
}

export default async function Dashboard({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const org = await getMyOrg(slug);
  if (!org) return null;

  let members = DEMO_MEMBERS.length;
  let pending = DEMO_STATS.pendingInvitations;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    members = (await listMembers(supabase, org.id)).length;
    pending = await countPendingInvitations(supabase, org.id);
  }

  const stats = [
    { label: "Members", value: String(members), hint: "People in this organization" },
    { label: "Pending invitations", value: String(pending), hint: "Links not yet used or expired" },
    { label: "Plan", value: org.plan === "team" ? "Team" : "Free", hint: org.plan === "team" ? "Up to unlimited members" : "Up to 3 members" },
    { label: "Your role", value: org.role[0].toUpperCase() + org.role.slice(1), hint: "Your permissions here" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
