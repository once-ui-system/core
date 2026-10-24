import { Card, Column, Feedback, Grid, Heading, Meta, Schema, Text } from "@once-ui-system/core";
import { notFound } from "next/navigation";
import { baseURL, product } from "@/resources";
import { listOrgMembers, requireOrg } from "@/lib/orgs/server";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";

type PageProps = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.dashboard.title,
    description: product.dashboard.description,
    baseURL: baseURL,
    path: orgPath(org),
    image: product.dashboard.image,
    robots: product.dashboard.robots,
    alternates: product.dashboard.alternates,
  });
}

/** One figure on the dashboard. */
function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card direction="column" padding="20" gap="8" radius="l" border="neutral-alpha-weak" fillWidth>
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Heading as="p" variant="display-strong-xs">
        {value}
      </Heading>
      {hint && (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {hint}
        </Text>
      )}
    </Card>
  );
}

/**
 * The organization's dashboard: four figures. Without Supabase the figures
 * are the demo workspace's, which has no members yet.
 */
export default async function Dashboard({ params }: PageProps) {
  const { org } = await params;
  const configured = isSupabaseConfigured();

  let members = 0;
  let admins = 0;
  let plan = "free";
  let role = "owner";
  let name = "Demo workspace";

  if (configured) {
    const guard = await requireOrg(org);
    if (!guard.ok) notFound();
    const list = await listOrgMembers(guard);
    const rows = list.ok ? list.members : [];
    members = rows.length;
    admins = rows.filter((m) => m.role === "admin" || m.role === "owner").length;
    plan = guard.org.plan;
    role = guard.role;
    name = guard.org.name;
  }

  return (
    <Column fillWidth gap="24" paddingY="16">
      <Schema as="webPage" baseURL={baseURL} title={product.dashboard.title} description={product.dashboard.description} path={orgPath(org)} />
      <Column gap="4">
        <Heading as="h1" variant="display-strong-s">
          {name}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Your organization at a glance.
        </Text>
      </Column>
      {!configured && (
        <Feedback variant="info" description="Supabase is not configured, so this is the demo workspace. Add the Supabase variables from .env.example to see your own organizations." />
      )}
      <Grid fillWidth columns={4} m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        <StatCard label="Members" value={String(members)} />
        <StatCard label="Admins and owners" value={String(admins)} />
        <StatCard label="Plan" value={plan === "team" ? "Team" : "Free"} hint={plan === "team" ? "Unlimited members" : "Up to 3 members"} />
        <StatCard label="Your role" value={role.charAt(0).toUpperCase() + role.slice(1)} />
      </Grid>
      <Text variant="body-default-s" onBackground="neutral-weak">
        Invite people from <a href={orgPath(org, "/members")}>Members</a>.
      </Text>
    </Column>
  );
}
