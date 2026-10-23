import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcceptInvite } from "../../../../components/AcceptInvite";
import { liveReady } from "../../../../lib/context";
import { getSessionUser } from "../../../../lib/orgs";

export const metadata: Metadata = {
  title: "Join an organization",
  description: "Accept your invitation to join an organization on Acme Notes.",
  robots: { index: false },
};

export default async function Invite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const live = liveReady();
  if (live && !(await getSessionUser())) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);
  return (
    <Column fillWidth maxWidth="xs" gap="16" background="surface" border radius="l" padding="32">
      <Heading as="h1" variant="heading-strong-xl">
        You are invited
      </Heading>
      <Text onBackground="neutral-weak">Join the organization to see its members and notebooks.</Text>
      <AcceptInvite token={token} demo={!live} />
    </Column>
  );
}
