import type { Metadata } from "next";
import Link from "next/link";
import { Button, Column, Feedback, Heading, Text } from "@once-ui-system/core";
import { AcceptInvite } from "@/components/auth/AcceptInvite";
import { getCurrentUser } from "@/lib/orgs/guard";
import { findInvitationByHash } from "@/lib/orgs/data";
import { hashInviteToken } from "@/lib/orgs/tokens";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, auth } from "@/resources";

const seo = auth.invite;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  robots: seo.robots,
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <Feedback
        variant="warning"
        title="Supabase is not configured"
        description="Invitations need Supabase. Set the variables in .env."
      />
    );
  }

  const invitation = await findInvitationByHash(hashInviteToken(token));
  if (!invitation) {
    return <Heading as="h1" variant="display-strong-xs">This invitation does not exist.</Heading>;
  }
  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    return (
      <Column gap="16">
        <Heading as="h1" variant="display-strong-xs">This invitation has expired.</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Ask an owner or admin of {invitation.organization.name} for a new link.
        </Text>
      </Column>
    );
  }

  const { name, slug } = invitation.organization;
  const role = invitation.role;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Column gap="16">
        <Heading as="h1" variant="display-strong-xs">Join {name}</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Sign in or create an account to join {name} as {role === "admin" ? "an admin" : "a member"}.
        </Text>
        <Button
          variant="primary"
          label="Sign in to join"
          href={`/auth?next=${encodeURIComponent(`/invite/${token}`)}`}
        />
        <Text variant="body-default-s" onBackground="neutral-weak">
          <Link href="/">Back to the start page</Link>
        </Text>
      </Column>
    );
  }

  return <AcceptInvite token={token} name={name} slug={slug} role={role} />;
}
