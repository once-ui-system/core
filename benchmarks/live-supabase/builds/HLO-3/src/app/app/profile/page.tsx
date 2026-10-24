import { Button, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer, listOrgs } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your account and organizations.",
};

export default async function ProfilePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth");
  const orgs = await listOrgs(viewer);

  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Profile
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {viewer.email}
        </Text>
      </Column>
      <Column gap="8" background="surface" border radius="l" padding="24">
        <Heading as="h2" variant="heading-strong-m">
          Your organizations
        </Heading>
        {orgs.map((org) => (
          <Button key={org.id} href={`/app/${org.slug}`} variant="tertiary" label={org.name} horizontal="start" />
        ))}
        <Button href="/app/new" variant="secondary" label="New organization" />
      </Column>
    </Column>
  );
}
