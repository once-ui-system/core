import { Button, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { getCurrentUser } from "../../../lib/auth";
import { pageMetadata } from "../../../lib/seo";
import { isSupabaseConfigured } from "../../../lib/supabase/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Profile",
  description: "Your Acme Notes account.",
  path: "/app/profile",
});

export default async function Profile() {
  const user = await getCurrentUser();
  return (
    <Column maxWidth="s" gap="24">
      <Heading as="h1" variant="display-strong-xs">
        Profile
      </Heading>
      <Column background="surface" border radius="l" padding="24" gap="16">
        <Column gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Email
          </Text>
          <Text variant="body-default-m">{isSupabaseConfigured() ? (user?.email ?? "Not signed in") : "Demo mode"}</Text>
        </Column>
        {isSupabaseConfigured() && (
          <Button href="/auth/update-password" variant="secondary" label="Change password" />
        )}
      </Column>
    </Column>
  );
}
