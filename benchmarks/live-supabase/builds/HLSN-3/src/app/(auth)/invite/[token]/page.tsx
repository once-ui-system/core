import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Column, Heading, Text } from "@once-ui-system/core";
import { AcceptInvite } from "@/components/app/AcceptInvite";
import { SupabaseNotice } from "@/components/SupabaseNotice";
import { isSupabaseConfigured } from "@/lib/env";
import { getViewer } from "@/lib/session";
import { createAdminSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join organization - Acme Notes",
  description: "Accept an invitation to an Acme Notes organization.",
  robots: { index: false, follow: false },
};

/** The accept page for an invitation link. Signed-out visitors sign in first and come back here. */
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Heading as="h1" variant="display-strong-xs">
          Invitations
        </Heading>
        <SupabaseNotice />
      </>
    );
  }

  const viewer = await getViewer();
  if (!viewer) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);

  const admin = createAdminSupabase();
  const { data: invitation } = await admin
    .from("invitations")
    .select("expires_at, organizations(name)")
    .eq("token", token)
    .maybeSingle();
  if (!invitation) notFound();

  const expired = new Date(invitation.expires_at as string).getTime() <= Date.now();
  const orgName =
    (invitation.organizations as unknown as { name: string } | null)?.name ?? null;

  return (
    <Column gap="16">
      <Heading as="h1" variant="display-strong-xs">
        Join organization
      </Heading>
      {expired ? (
        <Text variant="body-default-m" onBackground="neutral-medium">
          This invitation has expired. Ask for a new link.
        </Text>
      ) : (
        <AcceptInvite token={token} orgName={orgName} />
      )}
    </Column>
  );
}
