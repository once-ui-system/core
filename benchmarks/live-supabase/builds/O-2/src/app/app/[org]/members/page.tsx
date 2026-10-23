import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { InviteForm } from "../../../../components/OrgForms";
import { demoMembers, orgsFor, requireSession } from "../../../../lib/appdata";
import { canManage, listMembers } from "../../../../lib/orgs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Members", description: "People in your organization and invitations." };

export default async function Members({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const session = await requireSession();
  const org = (await orgsFor(session)).find((o) => o.slug === slug)!;
  const members = session.demo ? demoMembers : await listMembers(org.id);
  return (
    <>
      <Heading as="h1" variant="display-strong-xs">
        Members
      </Heading>
      <Column as="ul" margin="0" padding="0" gap="8" style={{ listStyle: "none" }}>
        {members.map((m) => (
          <Row as="li" key={m.user_id} horizontal="between" vertical="center" padding="16" border radius="m" background="page">
            <Text>{m.email}</Text>
            <Tag label={m.role} />
          </Row>
        ))}
      </Column>
      {canManage(org.role) && <InviteForm org={org.slug} demo={session.demo} />}
    </>
  );
}
