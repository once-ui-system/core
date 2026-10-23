import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { loadOrgContext } from "../../../../../lib/context";

export const metadata: Metadata = { title: "Profile", description: "Your account details." };

export default async function Profile({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { user, org } = await loadOrgContext(slug);
  return (
    <Column fillWidth gap="16">
      <Heading as="h1" variant="display-strong-xs">
        Profile
      </Heading>
      <Text>Email: {user.email}</Text>
      <Text onBackground="neutral-weak">Role in {org.name}: {org.role}</Text>
    </Column>
  );
}
