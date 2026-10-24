import type { Metadata } from "next";
import { Column, Heading, Text } from "@once-ui-system/core";
import { RenameOrgForm } from "@/components/app/RenameOrgForm";
import { UpgradeButton } from "@/components/app/UpgradeButton";
import { checkOrgAccessOrDemo } from "@/lib/orgs/guard";
import { isSupabaseConfigured } from "@/lib/env";
import { getViewer } from "@/lib/session";
import { DEMO_ORG, FREE_MEMBER_LIMIT, hasRole } from "@/lib/orgs/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings - Acme Notes",
  description: "Organization name and plan.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { org: slug } = await params;
  const { upgraded } = await searchParams;
  const viewer = await getViewer();
  const check = await checkOrgAccessOrDemo(slug, viewer?.id ?? null);
  if (!check.ok) return null;
  const { org } = check;
  const canManage = hasRole(org.role, "admin");
  const live = isSupabaseConfigured() && org.id !== DEMO_ORG.id;

  return (
    <Column gap="32" fillWidth maxWidth="m">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-medium">
          {canManage ? "Owners and admins can change these settings." : "Only owners and admins can change these settings."}
        </Text>
      </Column>

      <Column gap="16" background="surface" border radius="l" padding="24">
        <Heading as="h2" variant="heading-strong-m">
          Organization name
        </Heading>
        <RenameOrgForm orgSlug={org.slug} name={org.name} disabled={!canManage || !live} />
      </Column>

      <Column gap="16" background="surface" border radius="l" padding="24">
        <Heading as="h2" variant="heading-strong-m">
          Plan
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-medium">
          {org.plan === "team"
            ? "This organization is on the Team plan: $8 per member per month."
            : `This organization is on the Free plan, which allows up to ${FREE_MEMBER_LIMIT} members.`}
        </Text>
        {upgraded === "1" && (
          <Text variant="body-default-s" onBackground="success-strong" role="status">
            Thanks. Your plan updates once the payment is confirmed.
          </Text>
        )}
        {canManage && live && org.plan !== "team" && <UpgradeButton orgSlug={org.slug} />}
      </Column>
    </Column>
  );
}
