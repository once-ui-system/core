import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcceptInviteForm } from "@/components/org/AcceptInviteForm";
import { DemoNotice } from "@/components/DemoNotice";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join organization",
  description: "Accept an invitation to an Acme Notes organization.",
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <Column background="surface" border radius="l" padding="32" gap="24">
        <Heading as="h1" variant="display-strong-xs">
          Join organization
        </Heading>
        <DemoNotice />
      </Column>
    );
  }

  const sb = await createSessionClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);

  return (
    <Column background="surface" border radius="l" padding="32" gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Join organization
        </Heading>
        <Text onBackground="neutral-medium">
          Accepting adds your account to the organization with the role this invitation grants.
        </Text>
      </Column>
      <AcceptInviteForm token={token} />
    </Column>
  );
}
