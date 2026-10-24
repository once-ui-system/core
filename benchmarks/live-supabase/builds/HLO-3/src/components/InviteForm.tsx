"use client";

import { Button, Column, Input, Row, Select, Text } from "@once-ui-system/core";
import { useState } from "react";

export function InviteForm({ slug }: { slug: string }) {
  const [role, setRole] = useState<"member" | "admin">("member");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setPending(true);
    setError(null);
    const response = await fetch(`/api/orgs/${slug}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || undefined, role }),
    });
    const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    setPending(false);
    if (!response.ok || !body.url) {
      setLink(null);
      setError(body.error ?? "The invitation could not be created.");
      return;
    }
    setLink(body.url);
  }

  return (
    <Column background="surface" border radius="l" padding="24" gap="16" fillWidth>
      <form onSubmit={submit}>
        <Column gap="16">
          <Input id="invite-email" name="email" type="email" label="Email (optional)" />
          <Select
            id="invite-role"
            label="Role"
            options={[
              { value: "member", label: "Member" },
              { value: "admin", label: "Admin" },
            ]}
            value={role}
            onSelect={(value) => {
              if (value === "member" || value === "admin") setRole(value);
            }}
          />
          <Row>
            <Button type="submit" label="Create invite link" loading={pending} />
          </Row>
        </Column>
      </form>
      {error ? (
        <Text variant="body-default-s" onBackground="danger-medium" role="alert">
          {error}
        </Text>
      ) : null}
      {link ? (
        <Column gap="8">
          <Text variant="label-default-s">Invite link (valid for 7 days)</Text>
          <Text variant="body-default-s" onBackground="neutral-weak" style={{ wordBreak: "break-all" }}>
            {link}
          </Text>
        </Column>
      ) : null}
    </Column>
  );
}
