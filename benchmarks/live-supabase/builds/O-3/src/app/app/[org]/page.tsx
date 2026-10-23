import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { DEMO_MEMBERS } from "@/lib/demo";
import { loadContext } from "@/lib/context";
import { countPendingInvitations, listMembers } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "An overview of your organization.",
};

export default async function Dashboard({ params }: { params: Promise<{ org: string }> }) {
  const ctx = await loadContext((await params).org);
  const org = ctx.current!;
  const members = ctx.demo ? DEMO_MEMBERS : await listMembers(org.id);
  const pending = ctx.demo ? 2 : await countPendingInvitations(org.id);
  const stats = [
    { label: "Members", value: String(members.length) },
    { label: "Admins and owners", value: String(members.filter((m) => m.role !== "member").length) },
    { label: "Pending invitations", value: String(pending) },
    { label: "Plan", value: org.plan === "team" ? "Team" : "Free" },
  ];
  return (
    <>
      <Column gap="8">
        <Heading variant="display-strong-xs" as="h1">
          {org.name}
        </Heading>
        <Text onBackground="neutral-weak">Dashboard</Text>
      </Column>
      <Grid columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
        {stats.map((s) => (
          <Column key={s.label} background="page" border radius="l" padding="24" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {s.label}
            </Text>
            <Heading variant="display-strong-s" as="p">
              {s.value}
            </Heading>
          </Column>
        ))}
      </Grid>
    </>
  );
}
