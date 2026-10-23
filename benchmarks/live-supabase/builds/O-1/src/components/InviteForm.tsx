"use client";

import { Button, Column, Input, SegmentedControl, Text } from "@once-ui-system/core";
import { useState } from "react";

export function InviteForm({ slug, canInvite, demo }: { slug: string; canInvite: boolean; demo: boolean }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  if (!canInvite) {
    return (
      <Text onBackground="neutral-weak" variant="body-default-s">
        Only owners and admins can invite people.
      </Text>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLink("");
    setBusy(true);
    try {
      const res = await fetch(`/api/orgs/${slug}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, ...(email ? { email } : {}) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not create the invitation");
      setLink(body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Column gap="16" maxWidth="s">
        <Input id="invite-email" type="email" label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <SegmentedControl
          semantics="radio"
          buttons={[
            { value: "member", label: "Member" },
            { value: "admin", label: "Admin" },
          ]}
          defaultValue="member"
          onChange={setRole}
        />
        {error && (
          <Text role="alert" onBackground="danger-medium" variant="body-default-s">
            {error}
          </Text>
        )}
        {demo && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Demo mode: invitations need Supabase.
          </Text>
        )}
        <Button type="submit" loading={busy} disabled={demo} label="Create invitation link" />
        {link && (
          <Column gap="4" role="status">
            <Text variant="label-default-s">Share this link. It expires in 7 days.</Text>
            <Text variant="code-default-s" style={{ wordBreak: "break-all" }}>
              {link}
            </Text>
          </Column>
        )}
      </Column>
    </form>
  );
}
