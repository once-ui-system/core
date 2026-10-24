import { Column, Feedback, Heading, Meta, Text } from "@once-ui-system/core";
import { baseURL, product } from "@/resources";
import { createClient } from "@/lib/sb/server";
import { isSupabaseConfigured } from "@/lib/sb/config";

export async function generateMetadata() {
  return Meta.generate({
    title: product.profile.title,
    description: product.profile.description,
    baseURL: baseURL,
    path: product.profile.path,
    robots: product.profile.robots,
    alternates: product.profile.alternates,
  });
}

/** The account the session belongs to. Sign out is in the account menu. */
export default async function Profile() {
  let email: string | null = null;
  let created: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
    created = data.user?.created_at ?? null;
  }

  return (
    <Column fillWidth gap="24" paddingY="16" maxWidth="s">
      <Heading as="h1" variant="display-strong-s">Profile</Heading>
      {!isSupabaseConfigured() ? (
        <Feedback variant="info" description="Supabase is not configured, so there is no account to show." />
      ) : (
        <Column gap="8">
          <Text variant="label-default-s" onBackground="neutral-weak">Email</Text>
          <Text variant="body-default-m">{email ?? "Unknown"}</Text>
          <Text variant="label-default-s" onBackground="neutral-weak">Member since</Text>
          <Text variant="body-default-m">{created ? new Date(created).toLocaleDateString("en-GB") : "Unknown"}</Text>
        </Column>
      )}
    </Column>
  );
}
