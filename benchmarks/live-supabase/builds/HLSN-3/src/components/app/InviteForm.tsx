"use client";

import { Button, Column, Input, Row, SegmentedControl, Text } from "@once-ui-system/core";
import { useState } from "react";
import { apiErrorMessage } from "@/lib/api-error";

export type InviteRow = { token: string; email: string | null; role: string; expires_at: string };

/** Creates invitation links and lists the pending ones. Owners and admins only. */
export function InviteForm({ orgSlug, initial }: { orgSlug: string; initial: InviteRow[] }) {
  const [invites, setInvites] = useState<InviteRow[]>(initial);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const linkFor = (token: string) => `${window.location.origin}/invite/${token}`;

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${orgSlug}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, ...(email.trim() ? { email: email.trim() } : {}) }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(apiErrorMessage(body, "Could not create the invitation"));
        return;
      }
      setInvites((prev) => [
        {
          token: body.token,
          email: email.trim() || null,
          role,
          expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
        },
        ...prev,
      ]);
      setEmail("");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (token: string) => {
    await navigator.clipboard.writeText(linkFor(token));
    setCopied(token);
  };

  return (
    <Column gap="24" fillWidth>
      <Column as="form" gap="16" onSubmit={submit} maxWidth="s">
        <Input
          id="invite-email"
          name="email"
          type="email"
          label="Email (optional)"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <SegmentedControl
          buttons={[
            { value: "member", label: "Member" },
            { value: "admin", label: "Admin" },
          ]}
          value={role}
          onChange={(value) => setRole(value as "member" | "admin")}
        />
        {error && (
          <Text variant="body-default-s" onBackground="danger-strong" role="alert">
            {error}
          </Text>
        )}
        <Button type="submit" label="Create invitation link" loading={busy} disabled={busy} />
        <Text variant="body-default-s" onBackground="neutral-weak">
          Links expire after seven days.
        </Text>
      </Column>

      <Column gap="8" fillWidth>
        <Text variant="label-default-s" onBackground="neutral-weak">
          Pending invitations
        </Text>
        {invites.length === 0 && (
          <Text variant="body-default-m" onBackground="neutral-medium">
            No pending invitations.
          </Text>
        )}
        {invites.map((invite) => (
          <Row
            key={invite.token}
            background="surface"
            border
            radius="m"
            padding="16"
            horizontal="between"
            vertical="center"
            gap="16"
            wrap
          >
            <Column gap="4">
              <Text variant="body-default-m" onBackground="neutral-strong">
                {invite.email ?? "Anyone with the link"}
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {invite.role === "admin" ? "Admin" : "Member"} · expires{" "}
                {new Date(invite.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </Column>
            <Button
              variant="secondary"
              size="s"
              label={copied === invite.token ? "Link copied" : "Copy link"}
              onClick={() => copy(invite.token)}
            />
          </Row>
        ))}
      </Column>
    </Column>
  );
}
