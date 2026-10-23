import { Button, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { AcceptInvite } from "@/components/AcceptInvite";
import { isSupabaseConfigured } from "@/lib/env";
import { currentUser, lookupInvitation } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Join an organization",
  description: "Accept your invitation to an Acme Notes organization.",
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isSupabaseConfigured()) {
    return (
      <Card title="Invitations need Supabase">
        <Text onBackground="neutral-weak">Invitations are unavailable in demo mode.</Text>
      </Card>
    );
  }
  const inv = await lookupInvitation(token);
  if (inv.status !== "ok") {
    return (
      <Card title="Invitation unavailable">
        <Text onBackground="neutral-weak">
          {inv.status === "expired"
            ? "This invitation has expired. Ask for a new one."
            : inv.status === "used"
              ? "This invitation has already been used."
              : "This invitation link is not valid."}
        </Text>
      </Card>
    );
  }
  const user = await currentUser();
  return (
    <Card title={`Join ${inv.org.name}`}>
      <Text onBackground="neutral-weak">You are invited as {inv.role}.</Text>
      {user ? (
        <AcceptInvite token={token} />
      ) : (
        <Button href={`/auth?next=${encodeURIComponent(`/invite/${token}`)}`} label="Sign in to accept" />
      )}
    </Card>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Column maxWidth={28} fillWidth background="surface" border radius="l" padding="32" gap="16">
      <Heading variant="heading-strong-xl" as="h1">
        {title}
      </Heading>
      {children}
    </Column>
  );
}
