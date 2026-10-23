import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { InviteForm } from "@/components/InviteForm";
import { loadContext } from "@/lib/context";
import { DEMO_MEMBERS } from "@/lib/demo";
import { canManage, listMembers } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Members",
  description: "People in your organization, and invitations to add more.",
};

export default async function Members({ params }: { params: Promise<{ org: string }> }) {
  const ctx = await loadContext((await params).org);
  const org = ctx.current!;
  const members = ctx.demo ? DEMO_MEMBERS : await listMembers(org.id);
  return (
    <>
      <Heading variant="display-strong-xs" as="h1">
        Members
      </Heading>
      <Column background="page" border radius="l" as="ul" margin="0" padding="0" style={{ listStyle: "none" }}>
        {members.map((m, i) => (
          <Row
            as="li"
            key={m.user_id}
            horizontal="between"
            vertical="center"
            padding="16"
            gap="16"
            borderTop={i > 0}
          >
            <Text>{m.email || m.user_id}</Text>
            <Tag scheme={m.role === "owner" ? "brand" : m.role === "admin" ? "accent" : "neutral"} label={m.role} />
          </Row>
        ))}
      </Column>
      {canManage(org.role) ? (
        <InviteForm org={org.slug} />
      ) : (
        <Text onBackground="neutral-weak">Only owners and admins can invite people.</Text>
      )}
    </>
  );
}
