import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats, getOrgContext, getSessionUser } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "An overview of your organization in Acme Notes.",
};

export default async function Dashboard({ params }: { params: Promise<{ org: string }> }) {
  const user = await getSessionUser();
  const ctx = user && (await getOrgContext((await params).org, user.id));
  if (!ctx) notFound();
  const s = await dashboardStats(ctx.org.id);
  const stats = [
    { label: "Members", value: s.members },
    { label: "Notebooks", value: s.notebooks },
    { label: "Notes", value: s.notes },
    { label: "Pending invites", value: s.pending },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{ctx.org.name} on the {ctx.org.plan === "team" ? "Team" : "Free"} plan</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => (
          <Card key={st.label}>
            <CardHeader>
              <CardDescription>{st.label}</CardDescription>
              <CardTitle className="text-3xl">{st.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
