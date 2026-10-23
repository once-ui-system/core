import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { loadOrgContext } from "../../../../lib/context";
import { listMembers } from "../../../../lib/orgs";
import { createAdminClient } from "../../../../lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard", description: "An overview of your organization." };

export default async function Dashboard({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org, demo } = await loadOrgContext(slug);
  let members = 3;
  let pending = 1;
  if (!demo) {
    members = (await listMembers(org.id)).length;
    const { count } = await createAdminClient()
      .from("invitations")
      .select("token", { count: "exact", head: true })
      .eq("org_id", org.id)
      .gt("expires_at", new Date().toISOString());
    pending = count ?? 0;
  }
  const stats = [
    { label: "Members", value: String(members) },
    { label: "Open invitations", value: String(pending) },
    { label: "Plan", value: org.plan === "team" ? "Team" : "Free" },
    { label: "Your role", value: org.role[0].toUpperCase() + org.role.slice(1) },
  ];
  return (
    <Column fillWidth gap="24">
      <Heading as="h1" variant="display-strong-xs">
        {org.name}
      </Heading>
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        {stats.map((s) => (
          <Column key={s.label} background="page" border radius="l" padding="20" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {s.label}
            </Text>
            <Text variant="display-strong-xs">{s.value}</Text>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
