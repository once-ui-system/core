import { requireOrg, resolveUserAndService } from "@/lib/orgs/server";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";
import { Card, Column, Grid, Heading, Meta, Schema, Text } from "@once-ui-system/core";

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
    robots: product.dashboard.robots,
    alternates: product.dashboard.alternates,
  });
}

type Stat = { title: string; value: string; note: string; href?: string };

/** Four numbers about the organization; sample values in demo mode. */
async function loadStats(slug: string): Promise<{ name: string; stats: Stat[] }> {
  const base = orgPath(slug);
  if (!isSupabaseConfigured() || slug === DEMO_ORG_SLUG) {
    return {
      name: "Demo workspace",
      stats: [
        { title: "Members", value: "3", note: "People in this organization", href: `${base}/members` },
        { title: "Pending invitations", value: "1", note: "Links not yet accepted", href: `${base}/members` },
        { title: "Plan", value: "Free", note: "Up to 3 members", href: `${base}/settings` },
        { title: "Your role", value: "Owner", note: "What you can do here" },
      ],
    };
  }

  const guard = await requireOrg(slug);
  if (!guard.ok) return { name: slug, stats: [] };

  const auth = await resolveUserAndService();
  const service = auth.ok ? auth.service : null;
  let members = 0;
  let pending = 0;
  if (service) {
    const m = await service
      .from("organization_members")
      .select("user_id", { count: "exact", head: true })
      .eq("organization_id", guard.org.id);
    members = m.count ?? 0;
    const p = await service
      .from("organization_invitations")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", guard.org.id)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString());
    pending = p.count ?? 0;
  }

  const plan = guard.org.plan === "team" ? "Team" : "Free";
  const role = guard.role.charAt(0).toUpperCase() + guard.role.slice(1);
  return {
    name: guard.org.name,
    stats: [
      { title: "Members", value: String(members), note: "People in this organization", href: `${base}/members` },
      { title: "Pending invitations", value: String(pending), note: "Links not yet accepted", href: `${base}/members` },
      { title: "Plan", value: plan, note: plan === "Team" ? "$8 per member per month" : "Up to 3 members", href: `${base}/settings` },
      { title: "Your role", value: role, note: "What you can do here" },
    ],
  };
}

export default async function Dashboard({ params }: PageProps) {
  const { org } = await params;
  const { name, stats } = await loadStats(org);

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.dashboard.title}
        description={product.dashboard.description}
        path={orgPath(org)}
      />
      <Column fillWidth gap="24">
        <Heading paddingLeft="16" variant="display-strong-s">
          {name}
        </Heading>
        <Grid fillWidth columns={4} m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
          {stats.map((stat) => (
            <Card key={stat.title} href={stat.href} padding="20" gap="8" radius="l" fillWidth direction="column">
              <Text variant="label-default-s" onBackground="neutral-medium">
                {stat.title}
              </Text>
              <Heading as="p" variant="display-strong-xs">
                {stat.value}
              </Heading>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {stat.note}
              </Text>
            </Card>
          ))}
        </Grid>
      </Column>
    </>
  );
}
