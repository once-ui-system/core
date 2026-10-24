import { Button, Column, Feedback, Heading, Meta, Text } from "@once-ui-system/core";
import { previewInvitation } from "@/lib/orgs/invitations";
import { isInviteToken } from "@/lib/orgs/token";
import { baseURL, schema } from "@/resources";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { createClient } from "@/lib/sb/server";
import { AcceptInvite } from "./client";

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata() {
  return Meta.generate({
    title: `Join an organization - ${schema.name}`,
    description: "Accept an invitation to an organization.",
    baseURL: baseURL,
    path: "/invite",
    robots: "noindex,nofollow",
  });
}

/**
 * The invitation page. Signed out, it asks the visitor to sign in and comes
 * back here. Signed in, it names the organization and the role the link grants.
 */
export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <Column fillWidth maxWidth="s" gap="16" paddingY="64" horizontal="center">
        <Feedback variant="info" description="Supabase is not configured, so invitations cannot be accepted." />
      </Column>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return (
      <Column fillWidth maxWidth="s" gap="16" paddingY="64" horizontal="center">
        <Heading as="h1" variant="heading-strong-l">Join an organization</Heading>
        <Text onBackground="neutral-weak">Sign in to accept this invitation.</Text>
        <Button href={`/auth?next=${encodeURIComponent(`/invite/${token}`)}`} label="Sign in" />
      </Column>
    );
  }

  const preview = isInviteToken(token) ? await previewInvitation(token) : null;
  if (!preview || !preview.ok) {
    return (
      <Column fillWidth maxWidth="s" gap="16" paddingY="64" horizontal="center">
        <Heading as="h1" variant="heading-strong-l">This invitation cannot be used</Heading>
        <Text onBackground="neutral-weak">The link is invalid, has been used, or has expired.</Text>
      </Column>
    );
  }

  return (
    <Column fillWidth maxWidth="s" gap="16" paddingY="64" horizontal="center">
      <AcceptInvite
        token={token}
        organization={preview.preview.organization.name}
        role={preview.preview.role}
      />
    </Column>
  );
}
