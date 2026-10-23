import { Button, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { orgsFor, requireSession } from "../../../lib/appdata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile", description: "Your Acme Notes account." };

export default async function Profile() {
  const session = await requireSession();
  const orgs = await orgsFor(session);
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth="s" fillWidth gap="24" background="surface" border radius="l" padding="32">
        <Heading as="h1" variant="display-strong-xs">
          Profile
        </Heading>
        <Column gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Email
          </Text>
          <Text>{session.email}</Text>
        </Column>
        <Column gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Organizations
          </Text>
          {orgs.map((o) => (
            <a key={o.slug} href={`/app/${o.slug}`}>
              {o.name} ({o.role})
            </a>
          ))}
        </Column>
        <form method="post" action="/auth/signout">
          <Button type="submit" variant="secondary" label="Sign out" />
        </form>
      </Column>
    </Column>
  );
}
