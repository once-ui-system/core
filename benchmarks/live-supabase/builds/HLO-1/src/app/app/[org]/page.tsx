import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { canManage, countPendingInvitations, listMembers, orgPageAccess, roleLabel } from "../../../lib/orgs";
import { pageMetadata } from "../../../lib/seo";

type Params = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { org } = await params;
  return pageMetadata({ title: `Dashboard · ${org}`, description: "Members, plan and invitations for this organization.", path: `/app/${org}` });
}

export default async function Dashboard({ params }: Params) {
  const { org: slug } = await params;
  const { org } = await orgPageAccess(slug);
  const members = await listMembers(org);
  const pending = canManage(org.role) ? await countPendingInvitations(org.id) : null;

  const stats = [
    { label: "Members", value: String(members.length) },
    { label: "Plan", value: org.plan === "team" ? "Team" : "Free" },
    { label: "Your role", value: roleLabel(org.role) },
    { label: "Pending invitations", value: pending === null ? "Admins only" : String(pending) },
  ];

  return (
    <Column gap="24" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          {org.name}
        </Heading>
        <Text as="p" variant="body-default-m" onBackground="neutral-medium">
          Overview of this organization.
        </Text>
      </Column>
      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="16" fillWidth>
        {stats.map((stat) => (
          <Column key={stat.label} background="surface" border radius="l" padding="24" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {stat.label}
            </Text>
            <Text variant="display-strong-xs">{stat.value}</Text>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
