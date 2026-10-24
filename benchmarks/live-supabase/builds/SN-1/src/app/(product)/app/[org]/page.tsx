import { Card, Column, Grid, Heading, Meta, Row, Schema, Text } from "@once-ui-system/core";
import { baseURL, product } from "@/resources";
import { listInvitations } from "@/lib/orgs/invitations";
import { listOrgMembers, requireOrg } from "@/lib/orgs/server";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";

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
    alternates: product.dashboard.alternates,
  });
}

type Stat = { title: string; value: string; hint: string; href?: string };

/** The four cards: plan, members, open invitations and the caller's role. */
async function loadStats(org: string): Promise<{ name: string; stats: Stat[] }> {
  if (!isSupabaseConfigured()) {
    return {
      name: "Demo organization",
      stats: [
        { title: "Plan", value: "Free", hint: "Up to 3 members", href: orgPath(org, "/settings") },
        { title: "Members", value: "3", hint: "People in this organization", href: orgPath(org, "/members") },
        { title: "Open invitations", value: "1", hint: "Waiting to be accepted", href: orgPath(org, "/members") },
        { title: "Your role", value: "Owner", hint: "Sample data in demo mode" },
      ],
    };
  }

  const guard = await requireOrg(org);
  if (!guard.ok) return { name: org, stats: [] };

  const members = await listOrgMembers(guard);
  const invitations = guard.role === "member" ? null : await listInvitations(guard);
  const isFree = guard.org.plan === "free";

  return {
    name: guard.org.name,
    stats: [
      {
        title: "Plan",
        value: isFree ? "Free" : "Team",
        hint: isFree ? "Up to 3 members" : "$8 per member per month",
        href: orgPath(org, "/settings"),
      },
      {
        title: "Members",
        value: members.ok ? String(members.members.length) : "-",
        hint: "People in this organization",
        href: orgPath(org, "/members"),
      },
      {
        title: "Open invitations",
        value: invitations?.ok ? String(invitations.invitations.length) : "-",
        hint: invitations ? "Waiting to be accepted" : "Visible to admins and owners",
        href: orgPath(org, "/members"),
      },
      { title: "Your role", value: guard.role[0].toUpperCase() + guard.role.slice(1), hint: "In this organization" },
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
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12" fillWidth>
        {stats.map((stat) => (
          <Card key={stat.title} href={stat.href} padding="20" gap="8" radius="l" fillWidth direction="column">
            <Text variant="label-default-s" onBackground="neutral-medium">
              {stat.title}
            </Text>
            <Heading as="p" variant="display-strong-xs">
              {stat.value}
            </Heading>
            <Row>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {stat.hint}
              </Text>
            </Row>
          </Card>
        ))}
      </Grid>
    </>
  );
}
