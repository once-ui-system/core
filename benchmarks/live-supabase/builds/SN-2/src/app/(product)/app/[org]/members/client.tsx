"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { DEMO_ORG_SLUG } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Button, Column, Input, Row, Select, Tag, Text } from "@once-ui-system/core";
import { useCallback, useEffect, useState } from "react";

type Member = { user_id: string; email: string | null; role: "owner" | "admin" | "member" };

const DEMO_MEMBERS: Member[] = [
  { user_id: "1", email: "owner@acme-notes.example", role: "owner" },
  { user_id: "2", email: "admin@acme-notes.example", role: "admin" },
  { user_id: "3", email: "member@acme-notes.example", role: "member" },
];

export default function MembersClient({ org }: { org: string }) {
  const live = isSupabaseConfigured() && org !== DEMO_ORG_SLUG;
  const [members, setMembers] = useState<Member[]>(live ? [] : DEMO_MEMBERS);
  const [role, setRole] = useState<string | null>(live ? null : "owner");
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const base = `/api/orgs/${encodeURIComponent(org)}`;

  const load = useCallback(async () => {
    if (!live) return;
    setLoading(true);
    const [m, o] = await Promise.all([
      fetch(`${base}/members`, { credentials: "include", cache: "no-store" }),
      fetch(base, { credentials: "include", cache: "no-store" }),
    ]);
    if (!m.ok) {
      setError(apiErrorMessage(await m.json().catch(() => ({})), "Couldn't load the members"));
    } else {
      setMembers((await m.json()) as Member[]);
      setError(null);
    }
    if (o.ok) setRole(((await o.json()) as { role: string }).role);
    setLoading(false);
  }, [live, base]);

  useEffect(() => {
    void load();
  }, [load]);

  const canInvite = role === "owner" || role === "admin";

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setLink(null);
    if (!live) {
      setInviteError("Connect Supabase to invite people.");
      return;
    }
    setInviting(true);
    const res = await fetch(`${base}/invitations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(email.trim() ? { email: email.trim() } : {}), role: inviteRole }),
    });
    const body = await res.json().catch(() => ({}));
    setInviting(false);
    if (!res.ok) {
      setInviteError(apiErrorMessage(body, "Couldn't create the invitation"));
      return;
    }
    setLink((body as { url: string }).url);
    setEmail("");
  };

  return (
    <Column fillWidth gap="24" paddingX="16">
      <Column fillWidth gap="8">
        {error && <Text onBackground="danger-weak">{error}</Text>}
        {loading && <Text onBackground="neutral-weak">Loading members…</Text>}
        {members.map((member) => (
          <Row
            key={member.user_id}
            fillWidth
            horizontal="between"
            vertical="center"
            padding="16"
            radius="m"
            border="neutral-alpha-weak"
            gap="12"
          >
            <Text variant="body-default-m">{member.email ?? member.user_id}</Text>
            <Tag scheme={member.role === "owner" ? "brand" : "neutral"} label={member.role} />
          </Row>
        ))}
      </Column>

      {canInvite && (
        <form onSubmit={(e) => void invite(e)}>
          <Column fillWidth gap="12" padding="20" radius="l" border="neutral-alpha-weak" maxWidth={32}>
            <Text variant="heading-strong-s">Invite someone</Text>
            <Input
              id="invite-email"
              type="email"
              label="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select
              id="invite-role"
              label="Role"
              value={inviteRole}
              onSelect={(value) => setInviteRole(String(value))}
              options={[
                { label: "Member", value: "member" },
                { label: "Admin", value: "admin" },
              ]}
            />
            <Row>
              <Button type="submit" loading={inviting}>
                Create invite link
              </Button>
            </Row>
            {inviteError && <Text onBackground="danger-weak">{inviteError}</Text>}
            {link && (
              <Column gap="4">
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Share this link. It expires in 7 days.
                </Text>
                <Text variant="code-default-s" wrap="break-word">
                  {link}
                </Text>
              </Column>
            )}
          </Column>
        </form>
      )}
    </Column>
  );
}
