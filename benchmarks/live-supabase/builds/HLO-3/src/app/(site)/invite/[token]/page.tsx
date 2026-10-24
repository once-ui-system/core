import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JoinOrganization } from "@/components/JoinOrganization";
import { getViewer } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Join organization",
  description: "Accept an invitation to an Acme Notes organization.",
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const viewer = await getViewer();
  if (!viewer) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);

  return (
    <Column gap="24" maxWidth="xs" horizontal="center">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          You are invited
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Joining gives you access to the organization with the role this invitation grants.
        </Text>
      </Column>
      <JoinOrganization token={token} />
    </Column>
  );
}
