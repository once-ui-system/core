"use client";

import { Button, Column, Heading, Input, Row, Text } from "@once-ui-system/core";
import { useState } from "react";

export function InviteForm({ org }: { org: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setLink("");
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, ...(email ? { email } : {}) }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setLink(body.url);
      setEmail("");
    } else setError(body.error ?? "Could not create the invitation.");
  }

  return (
    <Column background="page" border radius="l" padding="24" gap="16">
      <Heading variant="heading-strong-l" as="h2">
        Invite by link
      </Heading>
      <form onSubmit={submit}>
        <Column gap="16">
          <Input id="invite-email" type="email" label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Row gap="8">
            <Button type="button" size="s" variant={role === "member" ? "primary" : "secondary"} label="Member" onClick={() => setRole("member")} />
            <Button type="button" size="s" variant={role === "admin" ? "primary" : "secondary"} label="Admin" onClick={() => setRole("admin")} />
          </Row>
          <Row>
            <Button type="submit" loading={busy} label="Create invite link" />
          </Row>
        </Column>
      </form>
      {error && (
        <Text role="alert" onBackground="danger-medium">
          {error}
        </Text>
      )}
      {link && (
        <Column gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Share this link. It expires in 7 days.
          </Text>
          <Text data-testid="invite-link" style={{ wordBreak: "break-all" }}>
            {link}
          </Text>
        </Column>
      )}
    </Column>
  );
}
