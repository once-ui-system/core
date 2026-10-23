import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { demoMembers, orgsFor, requireSession } from "../../../lib/appdata";
import { listMembers, pendingInvitationCount } from "../../../lib/orgs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard", description: "Your organization at a glance." };

export default async function Dashboard({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const session = await requireSession();
  const org = (await orgsFor(session)).find((o) => o.slug === slug)!;
  const members = session.demo ? demoMembers : await listMembers(org.id);
  const pending = session.demo ? 2 : await pendingInvitationCount(org.id);
  const stats = [
    { label: "Members", value: String(members.length) },
    { label: "Pending invitations", value: String(pending) },
    { label: "Plan", value: org.plan === "team" ? "Team" : "Free" },
    { label: "Created", value: org.created_at.slice(0, 10) },
  ];
  return (
    <>
      <Heading as="h1" variant="display-strong-xs">
        {org.name}
      </Heading>
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        {stats.map((s) => (
          <Column key={s.label} background="page" border radius="l" padding="24" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {s.label}
            </Text>
            <Heading as="p" variant="display-strong-xs">
              {s.value}
            </Heading>
          </Column>
        ))}
      </Grid>
    </>
  );
}
