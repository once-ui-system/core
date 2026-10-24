import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { InviteForm } from "../../../../components/InviteForm";
import { canManage, listMembers, orgPageAccess, roleLabel } from "../../../../lib/orgs";
import { pageMetadata } from "../../../../lib/seo";

type Params = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { org } = await params;
  return pageMetadata({ title: `Members · ${org}`, description: "Members of this organization and invitations.", path: `/app/${org}/members` });
}

export default async function Members({ params }: Params) {
  const { org: slug } = await params;
  const { org } = await orgPageAccess(slug);
  const members = await listMembers(org);

  return (
    <Column gap="24" fillWidth>
      <Heading as="h1" variant="display-strong-xs">
        Members
      </Heading>
      <Column background="surface" border radius="l" padding="8" gap="0">
        {members.map((member) => (
          <Row key={member.user_id} fillWidth horizontal="between" vertical="center" gap="12" paddingX="16" paddingY="12" borderBottom>
            <Text variant="body-default-m">{member.email}</Text>
            <Tag size="s" scheme={member.role === "member" ? "neutral" : "brand"} label={roleLabel(member.role)} />
          </Row>
        ))}
      </Column>
      {canManage(org.role) ? (
        <Column background="surface" border radius="l" padding="24" gap="16" maxWidth="s">
          <Column gap="4">
            <Heading as="h2" variant="heading-strong-m">
              Invite people
            </Heading>
            <Text as="p" variant="body-default-s" onBackground="neutral-medium">
              The link expires after 7 days. Anyone with the link can join with the role you choose.
            </Text>
          </Column>
          <InviteForm slug={org.slug} />
        </Column>
      ) : (
        <Text as="p" variant="body-default-s" onBackground="neutral-weak">
          Owners and admins invite people to this organization.
        </Text>
      )}
    </Column>
  );
}
