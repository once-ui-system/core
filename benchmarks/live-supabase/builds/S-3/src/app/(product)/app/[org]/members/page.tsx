import { listOrgMembers, requireOrg } from "@/lib/orgs/server";
import { orgPath, type OrgRole } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";
import { Column, Heading, Line, Meta, Row, Schema, Tag, Text } from "@once-ui-system/core";
import { InvitePanel } from "./InvitePanel";

type PageProps = { params: Promise<{ org: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.members.title,
    description: product.members.description,
    baseURL: baseURL,
    path: orgPath(org, "/members"),
    image: product.members.image,
    robots: product.members.robots,
    alternates: product.members.alternates,
  });
}

type Row_ = { user_id: string; email: string | null; role: OrgRole };

export default async function Members({ params }: PageProps) {
  const { org } = await params;

  let rows: Row_[] = [
    { user_id: "demo-1", email: "owner@example.com", role: "owner" },
    { user_id: "demo-2", email: "admin@example.com", role: "admin" },
    { user_id: "demo-3", email: "member@example.com", role: "member" },
  ];
  let canInvite = false;
  const configured = isSupabaseConfigured();

  if (configured) {
    const guard = await requireOrg(org);
    const result = guard.ok ? await listOrgMembers(guard) : null;
    rows = result?.ok ? result.members : [];
    canInvite = guard.ok && guard.role !== "member";
  }

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.members.title}
        description={product.members.description}
        path={orgPath(org, "/members")}
      />
      <Heading paddingLeft="16" variant="display-strong-s">
        Members
      </Heading>
      <Column fillWidth radius="l" border="neutral-alpha-weak" background="surface">
        {rows.map((member, i) => (
          <Column key={member.user_id} fillWidth>
            {i > 0 && <Line />}
            <Row fillWidth horizontal="between" vertical="center" paddingX="20" paddingY="16" gap="12">
              <Text variant="body-default-s">{member.email ?? member.user_id}</Text>
              <Tag scheme={member.role === "owner" ? "brand" : "neutral"} label={member.role} />
            </Row>
          </Column>
        ))}
        {rows.length === 0 && (
          <Text padding="20" onBackground="neutral-weak">
            No members yet.
          </Text>
        )}
      </Column>
      {configured ? (
        canInvite ? (
          <InvitePanel org={org} />
        ) : (
          <Text onBackground="neutral-weak" variant="body-default-s" paddingLeft="16">
            Only owners and admins can invite people.
          </Text>
        )
      ) : (
        <Text onBackground="neutral-weak" variant="body-default-s" paddingLeft="16">
          Invitations need Supabase. Sample members are shown in demo mode.
        </Text>
      )}
    </>
  );
}
