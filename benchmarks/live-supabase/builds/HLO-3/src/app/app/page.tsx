import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateOrgForm } from "@/components/CreateOrgForm";
import { getViewer, listOrgs } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Organizations",
  description: "Open your first organization or create one.",
};

// Sends the user to their first organization. With none, the page asks for a name.
export default async function AppIndex() {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth");
  const orgs = await listOrgs(viewer);
  if (orgs.length > 0) redirect(`/app/${orgs[0].slug}`);

  return (
    <Column gap="24" maxWidth="xs">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Create your first organization
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Notebooks, members and settings belong to an organization.
        </Text>
      </Column>
      <CreateOrgForm />
    </Column>
  );
}
