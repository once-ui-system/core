import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { SettingsForms } from "@/components/SettingsForms";
import { loadContext } from "@/lib/context";
import { canManage } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Settings",
  description: "Rename your organization and manage its plan.",
};

export default async function Settings({ params }: { params: Promise<{ org: string }> }) {
  const ctx = await loadContext((await params).org);
  const org = ctx.current!;
  return (
    <>
      <Heading variant="display-strong-xs" as="h1">
        Settings
      </Heading>
      {canManage(org.role) ? (
        <SettingsForms org={org.slug} name={org.name} plan={org.plan} />
      ) : (
        <Column background="page" border radius="l" padding="24" gap="8">
          <Text>Only owners and admins can change settings.</Text>
          <Tag scheme={org.plan === "team" ? "brand" : "neutral"} label={`Plan: ${org.plan}`} />
        </Column>
      )}
    </>
  );
}
