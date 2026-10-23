"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { Button, Column, Heading, Input, Row, Text } from "@once-ui-system/core";
import { useState } from "react";

/** Invite by link: an optional address and a role, answered with a link to copy. */
export function InvitePanel({ org }: { org: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setLink(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/invitations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() || undefined, role }),
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
    <Column fillWidth gap="16" padding="20" radius="l" border="neutral-alpha-weak" background="surface">
      <Heading as="h2" variant="heading-strong-l">
        Invite people
      </Heading>
      <form onSubmit={(e) => void submit(e)}>
        <Column fillWidth gap="12">
          <Input
            id="invite-email"
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Row gap="8">
            <Button type="button" size="s" variant={role === "member" ? "primary" : "secondary"} onClick={() => setRole("member")}>
              Member
            </Button>
            <Button type="button" size="s" variant={role === "admin" ? "primary" : "secondary"} onClick={() => setRole("admin")}>
              Admin
            </Button>
          </Row>
          {error && (
            <Text onBackground="danger-weak" variant="body-default-s">
              {error}
            </Text>
          )}
          <Row>
            <Button type="submit" loading={busy}>
              Create invitation link
            </Button>
          </Row>
        </Column>
      </form>
      {link && (
        <Column gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Share this link. It expires in 7 days.
          </Text>
          <Input id="invite-link" label="Invitation link" value={link} readOnly onFocus={(e) => e.currentTarget.select()} />
        </Column>
      )}
    </Column>
  );
}
