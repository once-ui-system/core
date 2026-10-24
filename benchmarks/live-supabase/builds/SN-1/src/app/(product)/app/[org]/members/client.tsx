"use client";

import { Button, Column, Heading, Input, Row, Select, Text, useToast } from "@once-ui-system/core";
import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage } from "@/lib/api-error-message";
import { isSupabaseConfigured } from "@/lib/sb/config";

type Member = { user_id: string; email: string | null; role: "owner" | "admin" | "member" };

const DEMO_MEMBERS: Member[] = [
  { user_id: "1", email: "owner@acme-notes.example", role: "owner" },
  { user_id: "2", email: "admin@acme-notes.example", role: "admin" },
  { user_id: "3", email: "member@acme-notes.example", role: "member" },
];

export default function MembersClient({ org }: { org: string }) {
  const configured = isSupabaseConfigured();
  const { addToast } = useToast();
  const base = `/api/orgs/${encodeURIComponent(org)}`;

  const [members, setMembers] = useState<Member[]>(configured ? [] : DEMO_MEMBERS);
  const [loading, setLoading] = useState(configured);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    const res = await fetch(`${base}/members`, { credentials: "include", cache: "no-store" });
    const body = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok || !Array.isArray(body)) {
      addToast({ variant: "danger", message: apiErrorMessage(body, "Couldn't load the members") });
      return;
    }
    setMembers(body as Member[]);
  }, [configured, base, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      addToast({ variant: "info", message: "Supabase is not configured, so invitations are off." });
      return;
    }
    setInviting(true);
    setLink(null);
    const res = await fetch(`${base}/invitations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(email.trim() ? { email: email.trim() } : {}), role }),
    });
    const body = await res.json().catch(() => ({}));
    setInviting(false);
    if (!res.ok) {
      addToast({ variant: "danger", message: apiErrorMessage(body, "Couldn't create the invitation") });
      return;
    }
    setLink((body as { url: string }).url);
    setEmail("");
  };

  return (
    <Column fillWidth gap="24" paddingX="16">
      <Heading variant="display-strong-s">Members</Heading>

      <Column fillWidth gap="0" border="neutral-alpha-medium" radius="l" overflow="hidden" background="surface">
        {loading && (
          <Text paddingX="20" paddingY="16" onBackground="neutral-weak">
            Loading
          </Text>
        )}
        {members.map((m) => (
          <Row
            key={m.user_id}
            fillWidth
            horizontal="between"
            vertical="center"
            paddingX="20"
            paddingY="16"
            borderBottom="neutral-alpha-weak"
          >
            <Text variant="body-default-m">{m.email ?? m.user_id}</Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {m.role}
            </Text>
          </Row>
        ))}
      </Column>

      <form onSubmit={(e) => void invite(e)}>
        <Column fillWidth maxWidth="s" gap="12">
          <Heading as="h2" variant="heading-strong-m">
            Invite someone
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Admins and owners create an invitation link that works for 7 days. Add an email to limit it to that
            address.
          </Text>
          <Input id="invite-email" label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            id="invite-role"
            label="Role"
            value={role}
            onSelect={(v) => setRole(Array.isArray(v) ? (v[0] ?? "member") : v)}
            options={[
              { label: "Member", value: "member" },
              { label: "Admin", value: "admin" },
            ]}
          />
          <Row>
            <Button type="submit" loading={inviting}>
              Create invitation link
            </Button>
          </Row>
          {link && (
            <Column gap="4" padding="12" radius="m" border="neutral-alpha-medium">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Share this link
              </Text>
              <Text variant="code-default-s" style={{ wordBreak: "break-all" }}>
                {link}
              </Text>
            </Column>
          )}
        </Column>
      </form>
    </Column>
  );
}
