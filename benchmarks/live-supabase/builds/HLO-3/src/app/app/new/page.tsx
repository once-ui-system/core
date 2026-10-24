import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateOrgForm } from "@/components/CreateOrgForm";
import { getViewer } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "New organization",
  description: "Create an organization in Acme Notes.",
};

export default async function NewOrgPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth");

  return (
    <Column gap="24" maxWidth="xs">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          New organization
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          You become its owner and can invite the rest of the team.
        </Text>
      </Column>
      <CreateOrgForm />
    </Column>
  );
}
