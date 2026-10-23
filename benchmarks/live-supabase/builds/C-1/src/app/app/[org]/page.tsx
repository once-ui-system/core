import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { countPendingInvites, getMembership, getUser, listMembers } from "@/lib/orgs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "An overview of your organization on Acme Notes.",
};

export default async function Dashboard({ params }: PageProps<"/app/[org]">) {
  const { org: slug } = await params;
  const user = await getUser();
  const org = user && (await getMembership(user.id, slug));
  if (!org) notFound();
  const [members, pending] = await Promise.all([listMembers(org.id), countPendingInvites(org.id)]);
  const stats = [
    { label: "Members", value: String(members.length) },
    { label: "Plan", value: org.plan === "team" ? "Team" : "Free" },
    { label: "Your role", value: org.role },
    { label: "Pending invitations", value: String(pending) },
  ];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{org.name}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl capitalize">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
