import { Column, Feedback, Heading, Meta, Row, Text } from "@once-ui-system/core";
import { notFound } from "next/navigation";
import { baseURL, product } from "@/resources";
import { listOrgMembers, requireOrg } from "@/lib/orgs/server";
import { orgPath, roleAtLeast } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { InviteForm } from "./InviteForm";

type PageProps = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.members.title,
    description: product.members.description,
    baseURL: baseURL,
    path: orgPath(org, "/members"),
    robots: product.members.robots,
    alternates: product.members.alternates,
  });
}

/** The members of the organization, and an invitation form for admins and owners. */
export default async function Members({ params }: PageProps) {
  const { org } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <Column fillWidth gap="24" paddingY="16">
        <Heading as="h1" variant="display-strong-s">Members</Heading>
        <Feedback variant="info" description="Supabase is not configured, so there are no members to show. Add the Supabase variables from .env.example." />
      </Column>
    );
  }

  const guard = await requireOrg(org);
  if (!guard.ok) notFound();
  const list = await listOrgMembers(guard);
  if (!list.ok) notFound();
  const canInvite = roleAtLeast(guard.role, "admin");

  return (
    <Column fillWidth gap="24" paddingY="16">
      <Column gap="4">
        <Heading as="h1" variant="display-strong-s">Members</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {list.members.length} {list.members.length === 1 ? "member" : "members"} in {guard.org.name}.
        </Text>
      </Column>

      <Column fillWidth border="neutral-alpha-weak" radius="l" overflow="hidden">
        {list.members.map((member) => (
          <Row key={member.user_id} fillWidth horizontal="between" vertical="center" paddingX="20" paddingY="12" borderBottom="neutral-alpha-weak">
            <Text variant="body-default-m">{member.email ?? "No email on record"}</Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </Text>
          </Row>
        ))}
      </Column>

      {canInvite && <InviteForm slug={guard.org.slug} />}
    </Column>
  );
}
