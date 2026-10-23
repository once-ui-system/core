import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { RenameForm, UpgradeButton } from "../../../../../components/SettingsForms";
import { loadOrgContext } from "../../../../../lib/context";
import { canManage } from "../../../../../lib/orgs";

export const metadata: Metadata = { title: "Settings", description: "Rename the organization and manage its plan." };

export default async function Settings({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org, demo } = await loadOrgContext(slug);
  const edit = canManage(org.role);
  return (
    <Column fillWidth gap="32">
      <Heading as="h1" variant="display-strong-xs">
        Settings
      </Heading>
      <Column gap="16">
        <Heading as="h2" variant="heading-strong-l">
          General
        </Heading>
        <RenameForm key={org.name} slug={org.slug} name={org.name} canEdit={edit} demo={demo} />
      </Column>
      <Column gap="16">
        <Heading as="h2" variant="heading-strong-l">
          Billing
        </Heading>
        <Text>
          Current plan: <Tag scheme={org.plan === "team" ? "brand" : "neutral"} label={org.plan === "team" ? "Team" : "Free"} />
        </Text>
        <UpgradeButton slug={org.slug} plan={org.plan} canEdit={edit} demo={demo} />
      </Column>
    </Column>
  );
}
