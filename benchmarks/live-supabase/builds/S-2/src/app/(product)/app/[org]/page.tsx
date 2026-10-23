import { listInvitations } from "@/lib/orgs/invitations";
import { listOrgMembers, requireOrg } from "@/lib/orgs/server";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";
import { Card, Column, Heading, Meta, Row, Schema, Text } from "@once-ui-system/core";

export const dynamic = "force-dynamic";

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
  });
}

type Stat = { title: string; value: string; note: string; href?: string };

/** The four numbers on the dashboard. Demo mode shows sample values. */
async function loadStats(org: string): Promise<{ name: string; stats: Stat[] }> {
  if (!isSupabaseConfigured()) {
    return {
      name: "Demo organization",
      stats: [
        { title: "Members", value: "3", note: "Sample data", href: orgPath(org, "/members") },
        { title: "Pending invitations", value: "1", note: "Sample data", href: orgPath(org, "/members") },
        { title: "Plan", value: "Free", note: "Up to 3 members", href: orgPath(org, "/settings") },
        { title: "Your role", value: "Owner", note: "Sample data" },
      ],
    };
  }

  const guard = await requireOrg(org);
  if (!guard.ok) return { name: org, stats: [] };

  const members = await listOrgMembers(guard);
  const canManage = guard.role === "owner" || guard.role === "admin";
  const invitations = canManage ? await listInvitations(guard) : null;
  const memberCount = members.ok ? members.members.length : 0;

  return {
    name: guard.org.name,
    stats: [
      { title: "Members", value: String(memberCount), note: "In this organization", href: orgPath(org, "/members") },
      {
        title: "Pending invitations",
        value: invitations?.ok ? String(invitations.invitations.length) : "n/a",
        note: canManage ? "Waiting to be accepted" : "Visible to admins and owners",
        href: canManage ? orgPath(org, "/members") : undefined,
      },
      {
        title: "Plan",
        value: guard.org.plan === "team" ? "Team" : "Free",
        note: guard.org.plan === "team" ? "$8 per member per month" : "Up to 3 members",
        href: orgPath(org, "/settings"),
      },
      { title: "Your role", value: guard.role.charAt(0).toUpperCase() + guard.role.slice(1), note: "In this organization" },
    ],
  };
}

export default async function Dashboard({ params }: PageProps) {
  const { org } = await params;
  const { name, stats } = await loadStats(org);

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.dashboard.title}
        description={product.dashboard.description}
        path={orgPath(org)}
      />
      <Column fillWidth gap="8" paddingX="16">
        <Heading variant="display-strong-s">Dashboard</Heading>
        <Text variant="body-default-m" onBackground="neutral-medium">
          {name}
        </Text>
      </Column>
      <Row fillWidth gap="12" wrap paddingX="16">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            href={stat.href}
            direction="column"
            gap="8"
            padding="20"
            radius="l"
            border="neutral-alpha-medium"
            minWidth={12}
            flex={1}
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
      </Row>
    </>
  );
}
