import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { CreateOrgForm } from "../../../components/CreateOrgForm";
import { loadUserOrgs } from "../../../lib/context";

export const metadata: Metadata = { title: "Your organizations", description: "Open or create an organization." };

export default async function AppIndex() {
  await connection(); // always rendered per request: the session decides
  const { orgs, demo } = await loadUserOrgs();
  if (orgs.length > 0) redirect(`/app/${orgs[0].slug}`);
  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth="xs" fillWidth gap="16" background="surface" border radius="l" padding="32">
        <Heading as="h1" variant="heading-strong-xl">
          Create your first organization
        </Heading>
        <Text onBackground="neutral-weak">Organizations hold your team's notebooks and members.</Text>
        <CreateOrgForm demo={demo} />
      </Column>
    </Column>
  );
}
