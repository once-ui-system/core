import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { InviteForm } from "../../../../../components/InviteForm";
import { loadOrgContext } from "../../../../../lib/context";
import { canManage, listMembers, type Member } from "../../../../../lib/orgs";

export const metadata: Metadata = { title: "Members", description: "Who belongs to this organization, and invitations." };

export default async function Members({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org, demo, user } = await loadOrgContext(slug);
  const members: Member[] = demo
    ? [
        { user_id: "1", email: user.email, role: "owner" },
        { user_id: "2", email: "sam@acme-notes.example", role: "admin" },
        { user_id: "3", email: "robin@acme-notes.example", role: "member" },
      ]
    : await listMembers(org.id);
  return (
    <Column fillWidth gap="32">
      <Heading as="h1" variant="display-strong-xs">
        Members
      </Heading>
      <Column as="ul" fillWidth gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
        {members.map((m) => (
          <Row as="li" key={m.user_id} background="page" border radius="m" paddingX="16" paddingY="12" horizontal="between" vertical="center">
            <Text>{m.email}</Text>
            <Tag scheme={m.role === "owner" ? "brand" : "neutral"} label={m.role} />
          </Row>
        ))}
      </Column>
      <Column gap="16">
        <Heading as="h2" variant="heading-strong-l">
          Invite people
        </Heading>
        <InviteForm slug={org.slug} canInvite={canManage(org.role)} demo={demo} />
      </Column>
    </Column>
  );
}
