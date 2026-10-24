"use client";

import { useState } from "react";
import { Button, Column, Feedback, Heading, Input, Row, Select, Text } from "@once-ui-system/core";

/** Creates an invitation link. The link is shown once, with a copy button. */
export function InviteForm({ slug, demo }: { slug: string; demo: boolean }) {
  const [role, setRole] = useState<"member" | "admin">("member");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (demo || busy) return;

    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(slug)}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, ...(email.trim() ? { email: email.trim() } : {}) }),
      });
      const body = (await response.json().catch(() => ({}))) as { url?: string; message?: string };
      if (!response.ok || !body.url) {
        setError(body.message ?? "Could not create the invitation. Try again.");
        return;
      }
      setLink(body.url);
      setEmail("");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setError("Copy failed. Select the link and copy it by hand.");
    }
  }

  return (
    <Column gap="16" padding="24" radius="l" border="neutral-alpha-weak" background="surface" maxWidth="m">
      <Heading as="h2" variant="heading-strong-s">Invite people</Heading>
      <Text variant="body-default-s" onBackground="neutral-weak">
        Links expire after seven days. Anyone with the link can join with the role you choose.
      </Text>
      <form onSubmit={submit}>
        <Column gap="16">
          <Select
            id="invite-role"
            label="Role"
            value={role}
            disabled={demo}
            options={[
              { value: "member", label: "Member" },
              { value: "admin", label: "Admin" },
            ]}
            onSelect={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              setRole(next === "admin" ? "admin" : "member");
            }}
          />
          <Input
            id="invite-email"
            name="email"
            type="email"
            label="Email (optional)"
            value={email}
            disabled={demo}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" variant="primary" label="Create invite link" loading={busy} disabled={demo} />
        </Column>
      </form>
      {link && (
        <Column gap="8">
          <Text variant="code-default-s" wrap="balance">{link}</Text>
          <Row gap="8">
            <Button size="s" variant="secondary" label={copied ? "Copied" : "Copy link"} onClick={copy} />
          </Row>
        </Column>
      )}
      {error && <Feedback variant="danger" description={error} />}
    </Column>
  );
}
