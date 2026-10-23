import { listInvitations } from "@/lib/orgs/invitations";
import { listOrgMembers, requireOrg } from "@/lib/orgs/server";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";
import { Column, Grid, Heading, Meta, Schema, Text } from "@once-ui-system/core";
import { notFound, redirect } from "next/navigation";
import { StatCard } from "./components/StatCard";

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
    robots: "noindex,nofollow",
  });
}

export default async function Dashboard({ params }: PageProps) {
  const { org } = await params;

  // Demo mode: sample numbers for any slug.
  let name = "Demo workspace";
  let members = "3";
  let invitations = "1";
  let plan = "Free";
  let role = "Owner";

  if (isSupabaseConfigured()) {
    const guard = await requireOrg(org);
    if (!guard.ok) {
      if (guard.status === 401) redirect("/auth");
      notFound();
    }
    name = guard.org.name;
    plan = guard.org.plan === "team" ? "Team" : "Free";
    role = guard.role.charAt(0).toUpperCase() + guard.role.slice(1);
    const list = await listOrgMembers(guard);
    members = list.ok ? String(list.members.length) : "-";
    if (guard.role === "member") {
      invitations = "-";
    } else {
      const open = await listInvitations(guard);
      invitations = open.ok ? String(open.invitations.length) : "-";
    }
  }

  return (
    <Column fillWidth gap="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.dashboard.title}
        description={product.dashboard.description}
        path={orgPath(org)}
      />
      <Column gap="4" paddingLeft="16">
        <Heading as="h1" variant="display-strong-s">
          Dashboard
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {name}
        </Text>
      </Column>
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" fillWidth>
        <StatCard label="Members" value={members} hint="People in this organization" />
        <StatCard label="Open invitations" value={invitations} hint="Links not yet used" />
        <StatCard label="Plan" value={plan} hint={plan === "Free" ? "Up to 3 members" : "$8 per member per month"} />
        <StatCard label="Your role" value={role} />
      </Grid>
    </Column>
  );
}
