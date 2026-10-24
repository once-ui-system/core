import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActionForm } from "../../../../components/ActionForm";
import { DemoNotice } from "../../../../components/DemoNotice";
import { getCurrentUser } from "../../../../lib/auth";
import { acceptInvitationAction } from "../../../../lib/actions/orgs";
import { getInvitation, roleLabel } from "../../../../lib/orgs";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";

export const metadata: Metadata = {
  title: "Join an organization",
  description: "Accept an invitation to an Acme Notes organization.",
  robots: { index: false, follow: false },
};

export default async function AcceptInvite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const configured = isSupabaseConfigured();

  const invite = configured ? await getInvitation(token) : null;
  const expired = invite ? new Date(invite.expires_at).getTime() <= Date.now() : false;
  const user = configured ? await getCurrentUser() : null;
  if (invite && !expired && !user) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);

  return (
    <Column horizontal="center" fillWidth paddingX="16" paddingY="64">
      <Column maxWidth="xs" gap="24">
        {!configured && <DemoNotice />}
        <Column gap="8">
          <Heading as="h1" variant="display-strong-xs">
            {invite && !expired ? `Join ${invite.org.name}` : "Invitation unavailable"}
          </Heading>
          {invite && !expired ? (
            <Text as="p" variant="body-default-m" onBackground="neutral-medium">
              You will join as {roleLabel(invite.role).toLowerCase()}.
            </Text>
          ) : (
            <Text as="p" variant="body-default-m" onBackground="neutral-medium">
              {configured
                ? expired
                  ? "This invitation has expired. Ask for a new one."
                  : "This invitation does not exist or has been removed."
                : "Invitations need Supabase, which is not configured."}
            </Text>
          )}
        </Column>
        {invite && !expired && (
          <ActionForm action={acceptInvitationAction} submitLabel={`Join ${invite.org.name}`}>
            <input type="hidden" name="token" value={token} />
          </ActionForm>
        )}
      </Column>
    </Column>
  );
}
