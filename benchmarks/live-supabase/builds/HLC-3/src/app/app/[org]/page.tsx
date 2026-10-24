import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_MEMBERS } from "@/lib/orgs/demo";
import { getOrgPageContext } from "@/lib/orgs/access";
import { countActiveInvitations, listMembers } from "@/lib/orgs/service";
import { canManage } from "@/lib/orgs/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your organization's members, plan and invitations.",
  robots: { index: false, follow: false },
};

export default async function Dashboard({ params }: PageProps<"/app/[org]">) {
  const { org: slug } = await params;
  const context = await getOrgPageContext(slug);
  if (!context) notFound();
  const { org, role } = context;

  let memberCount = DEMO_MEMBERS.length;
  let invitations: number | null = 0;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    memberCount = (await listMembers(supabase, org.id)).length;
    invitations = canManage(role) ? await countActiveInvitations(supabase, org.id) : null;
  }

  const stats = [
    { label: "Members", value: String(memberCount), hint: "People in this organization" },
    { label: "Plan", value: org.plan === "team" ? "Team" : "Free", hint: org.plan === "team" ? "Unlimited members" : "Up to 3 members" },
    { label: "Your role", value: role, hint: canManage(role) ? "You can manage people and settings" : "You can read and write notes" },
    {
      label: "Active invitations",
      value: invitations === null ? "Admins only" : String(invitations),
      hint: "Invitation links valid for 7 days",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl capitalize">{stat.value}</CardTitle>
              <CardDescription className="text-xs">{stat.hint}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
