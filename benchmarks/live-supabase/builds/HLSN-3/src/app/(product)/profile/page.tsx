import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Column, Heading, Text } from "@once-ui-system/core";
import { isSupabaseConfigured } from "@/lib/env";
import { listMemberships } from "@/lib/orgs/queries";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile - Acme Notes",
  description: "Your Acme Notes profile.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const viewer = await getViewer();
  if (isSupabaseConfigured() && !viewer) redirect("/auth?next=/profile");
  const orgs = await listMemberships(viewer?.id ?? null);

  return (
    <Column gap="24" fillWidth maxWidth="s">
      <Heading as="h1" variant="display-strong-xs">
        Profile
      </Heading>
      <Column gap="8" background="surface" border radius="l" padding="24">
        <Text variant="label-default-s" onBackground="neutral-weak">
          Email
        </Text>
        <Text variant="body-default-l" onBackground="neutral-strong">
          {viewer?.email || "Demo mode: no account is signed in"}
        </Text>
      </Column>
      <Column gap="8" background="surface" border radius="l" padding="24">
        <Text variant="label-default-s" onBackground="neutral-weak">
          Organizations
        </Text>
        {orgs.map((org) => (
          <Text key={org.id} variant="body-default-m" onBackground="neutral-medium">
            {org.name}
          </Text>
        ))}
      </Column>
    </Column>
  );
}
