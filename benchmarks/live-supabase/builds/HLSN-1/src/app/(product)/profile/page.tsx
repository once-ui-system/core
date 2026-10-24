import type { Metadata } from "next";
import { Column, Heading, Text } from "@once-ui-system/core";
import { getCurrentUser } from "@/lib/orgs/guard";
import { listOrgsForUser } from "@/lib/orgs/data";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";

// Depends on the environment at request time (demo mode or live Supabase).
export const dynamic = "force-dynamic";

const seo = product.profile;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  robots: seo.robots,
};

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <Column gap="16">
        <Heading as="h1" variant="display-strong-s">Profile</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">Demo mode: no account is signed in.</Text>
      </Column>
    );
  }

  const user = await getCurrentUser();
  const orgs = user ? await listOrgsForUser(user.id) : [];

  return (
    <Column gap="24" maxWidth="s">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">Profile</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">Signed in as {user?.email ?? "unknown"}.</Text>
      </Column>
      <Column gap="8">
        <Heading as="h2" variant="heading-strong-s">Organizations</Heading>
        {orgs.length === 0 && <Text variant="body-default-m" onBackground="neutral-weak">You are not in any organization yet.</Text>}
        {orgs.map((org) => (
          <Text key={org.id} variant="body-default-m">
            {org.name} ({org.role})
          </Text>
        ))}
      </Column>
    </Column>
  );
}
