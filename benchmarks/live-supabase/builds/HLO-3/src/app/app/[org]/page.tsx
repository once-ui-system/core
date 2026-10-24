import { Column, Heading, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { capitalize, listMembers, listOrgs, requireOrgAccess } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Members, plan and your role in this organization.",
};

export default async function DashboardPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { viewer, access } = await requireOrgAccess(org);
  const [members, orgs] = await Promise.all([listMembers(access.id), listOrgs(viewer)]);

  const stats = [
    { label: "Members", value: String(members.length), hint: "In this organization" },
    {
      label: "Plan",
      value: access.plan === "team" ? "Team" : "Free",
      hint: access.plan === "team" ? "Unlimited members" : "Up to 3 members",
    },
    { label: "Your role", value: capitalize(access.role), hint: "Set by the owner" },
    { label: "Organizations", value: String(orgs.length), hint: "You belong to" },
  ];

  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          {access.name}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Overview of this organization.
        </Text>
      </Column>
      <Column as="section" gap="16">
        <Row gap="16" wrap>
          {stats.map((stat) => (
            <Column key={stat.label} flex={1} minWidth={12} background="surface" border radius="l" padding="24" gap="8">
              <Text variant="label-default-s" onBackground="neutral-weak">
                {stat.label}
              </Text>
              <Heading as="p" variant="display-strong-xs">
                {stat.value}
              </Heading>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {stat.hint}
              </Text>
            </Column>
          ))}
        </Row>
      </Column>
    </Column>
  );
}
