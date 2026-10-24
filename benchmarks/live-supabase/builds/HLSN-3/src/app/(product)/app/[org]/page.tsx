import type { Metadata } from "next";
import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import { StatCard } from "@/components/app/StatCard";
import { checkOrgAccessOrDemo } from "@/lib/orgs/guard";
import { isSupabaseConfigured } from "@/lib/env";
import { getViewer } from "@/lib/session";
import { createAdminSupabase } from "@/lib/supabase/server";
import { DEMO_ORG, type Role } from "@/lib/orgs/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard - Acme Notes",
  description: "Overview of your organization.",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<Role, string> = { owner: "Owner", admin: "Admin", member: "Member" };

export default async function Dashboard({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const viewer = await getViewer();
  const check = await checkOrgAccessOrDemo(slug, viewer?.id ?? null);
  if (!check.ok) return null;
  const org = check.org;

  let members: number | string = "Not connected";
  let invitations: number | string = "Not connected";
  if (isSupabaseConfigured() && org.id !== DEMO_ORG.id) {
    const admin = createAdminSupabase();
    const [{ count: memberCount }, { count: inviteCount }] = await Promise.all([
      admin.from("memberships").select("user_id", { count: "exact", head: true }).eq("organization_id", org.id),
      admin
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .gt("expires_at", new Date().toISOString()),
    ]);
    members = memberCount ?? 0;
    invitations = inviteCount ?? 0;
  }

  return (
    <Column gap="32" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          {org.name}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-medium">
          Overview of your organization.
        </Text>
      </Column>
      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="16" fillWidth>
        <StatCard label="Members" value={members} />
        <StatCard label="Pending invitations" value={invitations} />
        <StatCard label="Plan" value={org.plan === "team" ? "Team" : "Free"} />
        <StatCard label="Your role" value={ROLE_LABEL[org.role]} />
      </Grid>
    </Column>
  );
}
