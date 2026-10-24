import type { Metadata } from "next";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { InviteForm } from "@/components/product/InviteForm";
import { canManage } from "@/lib/orgs/roles";
import { loadOrgPage } from "@/lib/orgs/guard";
import { baseURL, product } from "@/resources";

const seo = product.members;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  robots: seo.robots,
};

export default async function MembersPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const page = await loadOrgPage(slug);

  return (
    <Column gap="32" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Members
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {page.members.length} in {page.org.name}.
        </Text>
      </Column>
      <Column gap="0" radius="l" border="neutral-alpha-weak" background="surface" maxWidth="m">
        {page.members.map((member) => (
          <Row key={member.user_id} horizontal="between" vertical="center" gap="16" padding="16" wrap>
            <Text variant="body-default-m">{member.email ?? "No email on file"}</Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {member.role}
            </Text>
          </Row>
        ))}
      </Column>
      {canManage(page.role) && <InviteForm slug={page.org.slug} demo={page.demo} />}
    </Column>
  );
}
