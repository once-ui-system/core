import { Column, Grid, Heading, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { membersOf, loadWorkspace } from "@/lib/orgs/workspace";
import { canManage } from "@/lib/orgs/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Members, plan and your role in this organization.",
};

export default async function Dashboard({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const ws = await loadWorkspace(slug);
  const members = await membersOf(ws);
  const managers = members.filter((m) => canManage(m.role)).length;

  const stats = [
    { label: "Members", value: String(members.length) },
    { label: "Owners and admins", value: String(managers) },
    { label: "Plan", value: ws.org.plan === "team" ? "Team" : "Free" },
    { label: "Your role", value: ws.org.role },
  ];

  return (
    <Column gap="32" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          {ws.org.name}
        </Heading>
        <Text onBackground="neutral-medium">Overview of your organization.</Text>
      </Column>
      <Grid columns="4" s={{ columns: "2" }} xs={{ columns: "1" }} gap="16">
        {stats.map((stat) => (
          <Column key={stat.label} background="surface" border radius="l" padding="24" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {stat.label}
            </Text>
            <Heading as="p" variant="display-strong-xs">
              {stat.value}
            </Heading>
          </Column>
        ))}
      </Grid>
      <Column background="surface" border radius="l" padding="24" gap="8">
        <Text variant="label-strong-s">Notebooks</Text>
        <Text onBackground="neutral-medium">
          Shared notebooks arrive with the next release. Your members and plan are ready now.
        </Text>
        <Tag size="s" scheme={ws.org.plan === "team" ? "brand" : "neutral"} label={ws.org.plan === "team" ? "Team plan" : "Free plan"} />
      </Column>
    </Column>
  );
}
