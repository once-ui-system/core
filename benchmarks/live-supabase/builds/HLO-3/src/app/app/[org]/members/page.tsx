import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { InviteForm } from "@/components/InviteForm";
import { canManage, capitalize, listMembers, requireOrgAccess } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Members",
  description: "The people in this organization, and how to invite more.",
};

export default async function MembersPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { access } = await requireOrgAccess(org);
  const members = await listMembers(access.id);

  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Members
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {members.length} {members.length === 1 ? "person" : "people"} in {access.name}.
        </Text>
      </Column>

      <Column background="surface" border radius="l" as="section">
        {members.map((member, index) => (
          <Row
            key={member.user_id}
            horizontal="between"
            vertical="center"
            paddingX="24"
            paddingY="16"
            gap="16"
            borderTop={index > 0}
          >
            <Text variant="body-default-m">{member.email || "No email on file"}</Text>
            <Tag label={capitalize(member.role)} scheme={member.role === "member" ? "neutral" : "brand"} size="s" />
          </Row>
        ))}
      </Column>

      {canManage(access) ? (
        <Column gap="16" as="section">
          <Heading as="h2" variant="display-strong-xs">
            Invite people
          </Heading>
          <InviteForm slug={access.slug} />
        </Column>
      ) : null}
    </Column>
  );
}
