import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { RenameOrgForm } from "@/components/org/RenameOrgForm";
import { UpgradeButton } from "@/components/org/UpgradeButton";
import { loadWorkspace } from "@/lib/orgs/workspace";
import { canManage } from "@/lib/orgs/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Rename the organization and manage its plan.",
};

export default async function Settings({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { org: slug } = await params;
  const { checkout } = await searchParams;
  const ws = await loadWorkspace(slug);
  const manage = canManage(ws.org.role);

  return (
    <Column gap="32" maxWidth="s">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text onBackground="neutral-medium">Manage {ws.org.name}.</Text>
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" variant="heading-strong-l">
          Organization
        </Heading>
        <RenameOrgForm org={ws.org.slug} name={ws.org.name} canEdit={manage} />
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" variant="heading-strong-l">
          Plan
        </Heading>
        <Column gap="4" horizontal="start">
          <Tag size="s" scheme={ws.org.plan === "team" ? "brand" : "neutral"} label={ws.org.plan === "team" ? "Team" : "Free"} />
        </Column>
        {checkout === "success" && (
          <Text variant="body-default-s" onBackground="success-strong" role="status">
            Thanks. The plan changes once the payment is confirmed.
          </Text>
        )}
        {ws.org.plan === "team" ? (
          <Text onBackground="neutral-medium">This organization is on the Team plan.</Text>
        ) : manage ? (
          <>
            <Text onBackground="neutral-medium">
              The Team plan bills per member per month and lifts the three-member limit.
            </Text>
            {ws.isDemo ? (
              <Text onBackground="neutral-weak">Checkout opens once payments are connected.</Text>
            ) : (
              <UpgradeButton org={ws.org.slug} />
            )}
          </>
        ) : (
          <Text onBackground="neutral-medium">Ask an owner or admin to upgrade the plan.</Text>
        )}
      </Column>
    </Column>
  );
}
