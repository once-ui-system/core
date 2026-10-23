import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppContext } from "@/lib/orgs/context";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { countPendingInvitations, listMembers } from "@/lib/orgs/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "An overview of your organization.",
};

export default async function Dashboard({ params }: PageProps<"/app/[org]">) {
  const { org: slug } = await params;
  const { org, user } = await getAppContext(slug);
  let members = 1;
  let pending = 0;
  if (isSupabaseConfigured()) {
    members = (await listMembers(org.id)).length;
    pending = await countPendingInvitations(org.id);
  }
  const stats = [
    { label: "Members", value: String(members), hint: org.plan === "free" ? "Free plan: up to 3" : "Team plan" },
    { label: "Plan", value: org.plan === "team" ? "Team" : "Free", hint: "Current subscription" },
    { label: "Your role", value: org.role, hint: user.email },
    { label: "Pending invitations", value: String(pending), hint: "Links not yet accepted" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl capitalize">{s.value}</CardTitle>
            </CardHeader>
            <CardContent className="truncate text-xs text-muted-foreground">{s.hint}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
