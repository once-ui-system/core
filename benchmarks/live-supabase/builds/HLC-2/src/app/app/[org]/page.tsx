import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { orgAccessFor } from "@/lib/app-context";
import { countOpenInvitations, listMembers } from "@/lib/orgs/queries";
import { canManage, planLabel, roleLabel } from "@/lib/orgs/types";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Dashboard",
  description: "Overview of your organization.",
});

export default async function DashboardPage({ params }: PageProps<"/app/[org]">) {
  const { org: slug } = await params;
  const access = await orgAccessFor(slug);
  if (!access) notFound();
  const [members, invitations] = await Promise.all([
    listMembers(access.org.id),
    canManage(access.role) ? countOpenInvitations(access.org.id) : Promise.resolve(null),
  ]);

  const stats = [
    { title: "Members", value: String(members.length), note: "People in this organization" },
    { title: "Plan", value: planLabel[access.org.plan], note: access.org.plan === "team" ? "Team" : "Up to 3 members" },
    { title: "Your role", value: roleLabel[access.role], note: canManage(access.role) ? "Can invite and rename" : "Member access" },
    {
      title: "Open invitations",
      value: invitations === null ? "-" : String(invitations),
      note: invitations === null ? "Owners and admins only" : "Links valid for 7 days",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{access.org.name}</h1>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
              <CardDescription>{stat.note}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
