"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { Button, Column, Heading, Input, Row, Tag, Text } from "@once-ui-system/core";
import { useCallback, useEffect, useState } from "react";

type Member = { user_id: string; email: string | null; role: "owner" | "admin" | "member" };

const DEMO_MEMBERS: Member[] = [
  { user_id: "1", email: "ada@acme-notes.example", role: "owner" },
  { user_id: "2", email: "grace@acme-notes.example", role: "admin" },
  { user_id: "3", email: "alan@acme-notes.example", role: "member" },
  { user_id: "4", email: "edsger@acme-notes.example", role: "member" },
];

export function MembersClient({
  org,
  configured,
  canInvite,
}: { org: string; configured: boolean; canInvite: boolean }) {
  const [members, setMembers] = useState<Member[]>(configured ? [] : DEMO_MEMBERS);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"member" | "admin">("member");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!configured) return;
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/members`, { cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(apiErrorMessage(body, "Couldn't load the members"));
      return;
    }
    setMembers(body as Member[]);
  }, [configured, org]);

  useEffect(() => {
    void load();
  }, [load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setError("Supabase is not configured, so invitations are off.");
      return;
    }
    setBusy(true);
    setError(null);
    setLink(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, ...(email.trim() ? { email: email.trim() } : {}) }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(apiErrorMessage(body, "Couldn't create the invitation"));
      return;
    }
    setLink((body as { url: string }).url);
    setEmail("");
  };

  return (
    <Column fillWidth gap="24" paddingX="16">
      <Heading variant="display-strong-s">Members</Heading>
      <Column fillWidth gap="8">
        {members.map((m) => (
          <Row
            key={m.user_id}
            fillWidth
            horizontal="between"
            vertical="center"
            padding="12"
            radius="m"
            border="neutral-alpha-weak"
          >
            <Text variant="body-default-s">{m.email ?? m.user_id}</Text>
            <Tag scheme={m.role === "member" ? "neutral" : "brand"} label={m.role} />
          </Row>
        ))}
      </Column>
      {canInvite && (
        <form onSubmit={(e) => void invite(e)}>
          <Column fillWidth maxWidth={32} gap="12">
            <Heading as="h2" variant="heading-strong-l">
              Invite someone
            </Heading>
            <Input
              id="invite-email"
              label="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Row gap="8">
              <Button
                type="button"
                size="s"
                variant={role === "member" ? "primary" : "secondary"}
                onClick={() => setRole("member")}
              >
                Member
              </Button>
              <Button
                type="button"
                size="s"
                variant={role === "admin" ? "primary" : "secondary"}
                onClick={() => setRole("admin")}
              >
                Admin
              </Button>
            </Row>
            <Row>
              <Button type="submit" loading={busy}>
                Create invitation link
              </Button>
            </Row>
            {link && (
              <Column gap="4">
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Share this link. It expires in 7 days.
                </Text>
                <Text variant="body-default-s" style={{ wordBreak: "break-all" }}>
                  {link}
                </Text>
              </Column>
            )}
          </Column>
        </form>
      )}
      {error && (
        <Text onBackground="danger-weak" variant="body-default-s">
          {error}
        </Text>
      )}
    </Column>
  );
}
