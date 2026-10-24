import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { InviteForm } from "@/components/org/InviteForm";
import { loadWorkspace, membersOf } from "@/lib/orgs/workspace";
import { canManage, type Role } from "@/lib/orgs/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Members",
  description: "The people in this organization and how to invite more.",
};

const roleScheme: Record<Role, "brand" | "accent" | "neutral"> = {
  owner: "brand",
  admin: "accent",
  member: "neutral",
};

export default async function Members({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const ws = await loadWorkspace(slug);
  const members = await membersOf(ws);
  const manage = canManage(ws.org.role);

  return (
    <Column gap="32" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Members
        </Heading>
        <Text onBackground="neutral-medium">
          {members.length} {members.length === 1 ? "member" : "members"} in {ws.org.name}
        </Text>
      </Column>

      <Column background="surface" border radius="l" overflow="hidden">
        {members.map((member) => (
          <Row
            key={member.user_id}
            paddingX="16"
            paddingY="12"
            gap="12"
            vertical="center"
            horizontal="between"
            wrap
            borderBottom
          >
            <Text variant="body-default-m">{member.email}</Text>
            <Tag size="s" scheme={roleScheme[member.role]} label={member.role} />
          </Row>
        ))}
      </Column>

      {manage && (
        <Column background="surface" border radius="l" padding="24" gap="16" maxWidth="s">
          <Heading as="h2" variant="heading-strong-l">
            Invite people
          </Heading>
          <Text onBackground="neutral-medium">
            Create a link that adds someone to this organization. The link works for 7 days.
          </Text>
          <InviteForm org={ws.org.slug} />
        </Column>
      )}
    </Column>
  );
}
