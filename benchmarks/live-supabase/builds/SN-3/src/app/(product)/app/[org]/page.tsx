import { baseURL, product } from "@/resources";
import { orgPath } from "@/lib/orgs/types";
import { type OrgStats, orgStats, requireOrg } from "@/lib/orgs/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Card, Column, Grid, Heading, Meta, Text } from "@once-ui-system/core";

type PageProps = { params: Promise<{ org: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.dashboard.title,
    description: product.dashboard.description,
    baseURL,
    path: orgPath(org),
    image: product.dashboard.image,
  });
}

const DEMO: OrgStats = { members: 4, admins: 2, invitations: 1, plan: "free" };

export default async function Dashboard({ params }: PageProps) {
  const { org } = await params;

  let stats = DEMO;
  let name = "Demo organization";
  if (isSupabaseConfigured()) {
    const guard = await requireOrg(org);
    if (guard.ok) {
      stats = await orgStats(guard);
      name = guard.org.name;
    }
  }

  const cards = [
    { title: "Members", value: String(stats.members) },
    { title: "Admins and owners", value: String(stats.admins) },
    { title: "Open invitations", value: String(stats.invitations) },
    { title: "Plan", value: stats.plan === "team" ? "Team" : "Free" },
  ];

  return (
    <Column fillWidth gap="24" paddingX="16">
      <Heading variant="display-strong-s">Dashboard</Heading>
      <Text onBackground="neutral-weak">{name}</Text>
      <Grid fillWidth columns={4} m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
        {cards.map((card) => (
          <Card key={card.title} padding="20" gap="12" radius="l" fillWidth direction="column">
            <Text variant="label-default-s" onBackground="neutral-medium">
              {card.title}
            </Text>
            <Heading as="p" variant="display-strong-xs">
              {card.value}
            </Heading>
          </Card>
        ))}
      </Grid>
    </Column>
  );
}
