import { Column, Heading, Input, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ActionForm } from "../../../components/ActionForm";
import { createOrgAction } from "../../../lib/actions/orgs";
import { pageMetadata } from "../../../lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Create an organization",
  description: "Create an Acme Notes organization. You become its owner.",
  path: "/app/new",
});

export default function NewOrganization() {
  return (
    <Column maxWidth="xs" gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Create an organization
        </Heading>
        <Text as="p" variant="body-default-m" onBackground="neutral-medium">
          You will be its owner. Invite your team from the Members page.
        </Text>
      </Column>
      <ActionForm action={createOrgAction} submitLabel="Create organization">
        <Input id="name" name="name" label="Organization name" required maxLength={80} />
      </ActionForm>
    </Column>
  );
}
