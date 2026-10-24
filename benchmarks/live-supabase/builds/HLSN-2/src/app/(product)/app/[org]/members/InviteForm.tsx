"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { Button, Column, Feedback, Input, Row, Select, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Create an invitation link. The link is shown once, here: the server keeps
 * only its hash. Email is optional; without one, anyone signed in with the
 * link may join.
 */
export function InviteForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string[]>(["member"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setLink(null);
    try {
      const res = await fetch(`/api/orgs/${slug}/invitations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || undefined, role: role[0] ?? "member" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(apiErrorMessage(body, "Could not create the invitation"));
        return;
      }
      setLink((body as { url: string }).url);
      setEmail("");
      setCopied(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Column fillWidth gap="16" padding="20" radius="l" border="neutral-alpha-weak">
      <Column gap="4">
        <Text variant="heading-strong-s">Invite someone</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Create a link that expires after seven days. Copy it and send it yourself.
        </Text>
      </Column>
      <form onSubmit={(event) => void submit(event)}>
        <Column fillWidth gap="16">
          <Input id="invite-email" label="Email (optional)" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Select
            id="invite-role"
            label="Role"
            value={role}
            onSelect={(value) => setRole(Array.isArray(value) ? value : [value])}
            options={[
              { value: "member", label: "Member" },
              { value: "admin", label: "Admin" },
            ]}
          />
          {error && <Feedback variant="danger" description={error} />}
          <Row horizontal="end">
            <Button type="submit" loading={saving}>
              Create invitation link
            </Button>
          </Row>
        </Column>
      </form>
      {link && (
        <Column fillWidth gap="8">
          <Feedback variant="success" description="Invitation created. This link is shown only once." />
          <Row fillWidth gap="8" vertical="center">
            <Input id="invite-link" label="Invitation link" value={link} readOnly />
            <Button variant="secondary" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </Row>
        </Column>
      )}
    </Column>
  );
}
