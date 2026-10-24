import type { Metadata } from "next";
import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import { InviteForm, type InviteRow } from "@/components/app/InviteForm";
import { checkOrgAccessOrDemo, type Admin } from "@/lib/orgs/guard";
import { isSupabaseConfigured } from "@/lib/env";
import { getViewer } from "@/lib/session";
import { DEMO_ORG, hasRole, type Role } from "@/lib/orgs/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Members - Acme Notes",
  description: "People in your organization and their roles.",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<Role, string> = { owner: "Owner", admin: "Admin", member: "Member" };

type MemberRow = { user_id: string; email: string | null; role: Role };

export default async function MembersPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const viewer = await getViewer();
  const check = await checkOrgAccessOrDemo(slug, viewer?.id ?? null);
  if (!check.ok) return null;
  const { org } = check;
  const canInvite = hasRole(org.role, "admin");

  let members: MemberRow[] = [];
  let invites: InviteRow[] = [];
  if (isSupabaseConfigured() && org.id !== DEMO_ORG.id) {
    const admin = check.admin as Admin;
    const { data: rows } = await admin
      .from("memberships")
      .select("user_id, role, created_at")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: true });
    const ids = (rows ?? []).map((row) => row.user_id as string);
    const { data: profiles } = ids.length
      ? await admin.from("profiles").select("id, email").in("id", ids)
      : { data: [] as { id: string; email: string | null }[] };
    const emails = new Map((profiles ?? []).map((p) => [p.id as string, p.email as string | null]));
    members = (rows ?? []).map((row) => ({
      user_id: row.user_id as string,
      email: emails.get(row.user_id as string) ?? null,
      role: row.role as Role,
    }));

    if (canInvite) {
      const { data } = await admin
        .from("invitations")
        .select("token, email, role, expires_at")
        .eq("organization_id", org.id)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      invites = (data ?? []) as InviteRow[];
    }
  }

  return (
    <Column gap="32" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Members
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-medium">
          People in {org.name} and what they can do.
        </Text>
      </Column>

      <Column gap="8" fillWidth as="ul">
        {members.length === 0 && (
          <Text variant="body-default-m" onBackground="neutral-medium">
            {isSupabaseConfigured() ? "No members yet." : "Connect Supabase to see the members of an organization."}
          </Text>
        )}
        {members.map((member) => (
          <Column
            as="li"
            key={member.user_id}
            background="surface"
            border
            radius="m"
            padding="16"
            gap="4"
          >
            <Text variant="body-default-m" onBackground="neutral-strong">
              {member.email ?? "Email not available"}
            </Text>
            <Tag size="s" label={ROLE_LABEL[member.role]} />
          </Column>
        ))}
      </Column>

      {canInvite && isSupabaseConfigured() && org.id !== DEMO_ORG.id && (
        <Column gap="16" fillWidth>
          <Heading as="h2" variant="heading-strong-l">
            Invite people
          </Heading>
          <InviteForm orgSlug={org.slug} initial={invites} />
        </Column>
      )}
    </Column>
  );
}
