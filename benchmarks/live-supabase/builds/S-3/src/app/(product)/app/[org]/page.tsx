import { listInvitations } from "@/lib/orgs/invitations";
import { listOrgMembers, requireOrg } from "@/lib/orgs/server";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";
import { Card, Column, Grid, Heading, Meta, Schema, Text } from "@once-ui-system/core";

type PageProps = { params: Promise<{ org: string }> };

export const dynamic = "force-dynamic";

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

type Stat = { title: string; value: string; note: string; href?: string };

/** The four numbers on the dashboard, read through the tenancy guard. */
async function loadStats(slug: string): Promise<{ name: string; stats: Stat[] }> {
  if (!isSupabaseConfigured()) {
    return {
      name: "Demo organization",
      stats: [
        { title: "Members", value: "3", note: "Sample data" },
        { title: "Open invitations", value: "1", note: "Sample data" },
        { title: "Plan", value: "Free", note: "Up to 3 members" },
        { title: "Your role", value: "Owner", note: "Sample data" },
      ],
    };
  }

  const guard = await requireOrg(slug);
  if (!guard.ok) return { name: slug, stats: [] };

  const members = await listOrgMembers(guard);
  const admin = guard.role !== "member";
  const invitations = admin ? await listInvitations(guard) : null;
  const plan = guard.org.plan === "team" ? "Team" : "Free";

  return {
    name: guard.org.name,
    stats: [
      {
        title: "Members",
        value: members.ok ? String(members.members.length) : "-",
        note: "People in this organization",
        href: orgPath(slug, "/members"),
      },
      {
        title: "Open invitations",
        value: invitations?.ok ? String(invitations.invitations.length) : "-",
        note: admin ? "Waiting to be accepted" : "Visible to admins",
      },
      {
        title: "Plan",
        value: plan,
        note: plan === "Team" ? "$8 per member per month" : "Up to 3 members",
        href: orgPath(slug, "/settings"),
      },
      { title: "Your role", value: guard.role[0].toUpperCase() + guard.role.slice(1), note: "In this organization" },
    ],
  };
}

export default async function Dashboard({ params }: PageProps) {
  const { org } = await params;
  const { name, stats } = await loadStats(org ?? DEMO_ORG_SLUG);

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.dashboard.title}
        description={product.dashboard.description}
        path={orgPath(org)}
      />
      <Column gap="4" paddingLeft="16">
        <Heading variant="display-strong-s">Dashboard</Heading>
        <Text onBackground="neutral-weak">{name}</Text>
      </Column>
      <Grid columns={4} m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            href={stat.href}
            padding="20"
            gap="8"
            radius="l"
            fillWidth
            direction="column"
            border="neutral-alpha-weak"
          >
            <Text variant="label-default-s" onBackground="neutral-medium">
              {stat.title}
            </Text>
            <Heading as="p" variant="display-strong-xs">
              {stat.value}
            </Heading>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {stat.note}
            </Text>
          </Card>
        ))}
      </Grid>
    </>
  );
}
