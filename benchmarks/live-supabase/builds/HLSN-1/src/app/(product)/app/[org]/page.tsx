import type { Metadata } from "next";
import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import { loadOrgPage } from "@/lib/orgs/guard";
import { baseURL, product } from "@/resources";

const seo = product.dashboard;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  robots: seo.robots,
};

const ROLE_LABEL = { owner: "Owner", admin: "Admin", member: "Member" } as const;

export default async function Dashboard({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const page = await loadOrgPage(slug);

  const stats = [
    { label: "Members", value: String(page.members.length) },
    { label: "Pending invitations", value: String(page.pendingInvitations) },
    { label: "Plan", value: page.org.plan === "team" ? "Team" : "Free" },
    { label: "Your role", value: ROLE_LABEL[page.role] },
  ];

  return (
    <Column gap="32" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          {page.org.name}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          An overview of your organization.
        </Text>
      </Column>
      <Grid columns={4} s={{ columns: 1 }} m={{ columns: 2 }} gap="16" fillWidth>
        {stats.map((stat) => (
          <Column key={stat.label} gap="8" padding="24" radius="l" border="neutral-alpha-weak" background="surface">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {stat.label}
            </Text>
            <Heading as="p" variant="display-strong-xs">
              {stat.value}
            </Heading>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
