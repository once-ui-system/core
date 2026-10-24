"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { useOrg } from "@/components/OrgProvider";
import { Button, Column, Heading, Input, Row, Tag, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SettingsClient({
  org,
  name: initialName,
  plan,
  canManage,
  configured,
}: { org: string; name: string; plan: "free" | "team"; canManage: boolean; configured: boolean }) {
  const router = useRouter();
  const { refresh } = useOrg();
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(apiErrorMessage(body, "Couldn't rename the organization"));
      return;
    }
    setMessage("Saved.");
    await refresh();
    router.refresh();
  };

  const upgrade = async () => {
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing/checkout`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(apiErrorMessage(body, "Couldn't start checkout"));
      return;
    }
    window.location.assign((body as { url: string }).url);
  };

  return (
    <Column fillWidth gap="32" paddingX="16">
      <Heading variant="display-strong-s">Settings</Heading>
      <form onSubmit={(e) => void rename(e)}>
        <Column fillWidth maxWidth={32} gap="12">
          <Heading as="h2" variant="heading-strong-l">
            Organization name
          </Heading>
          <Input
            id="org-name"
            label="Name"
            value={name}
            disabled={!canManage}
            onChange={(e) => setName(e.target.value)}
          />
          {canManage ? (
            <Row>
              <Button type="submit" loading={busy} disabled={!name.trim()}>
                Save
              </Button>
            </Row>
          ) : (
            <Text variant="body-default-s" onBackground="neutral-weak">
              Only admins and owners can rename the organization.
            </Text>
          )}
        </Column>
      </form>
      <Column fillWidth maxWidth={32} gap="12">
        <Row gap="12" vertical="center">
          <Heading as="h2" variant="heading-strong-l">
            Plan
          </Heading>
          <Tag scheme={plan === "team" ? "brand" : "neutral"} label={plan === "team" ? "Team" : "Free"} />
        </Row>
        {plan === "free" ? (
          <>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Free includes up to 3 members. Team is $8 per member per month.
            </Text>
            {canManage && (
              <Row>
                <Button onClick={() => void upgrade()} loading={busy}>
                  Upgrade to Team
                </Button>
              </Row>
            )}
          </>
        ) : (
          <Text variant="body-default-s" onBackground="neutral-weak">
            This organization is on the Team plan.
          </Text>
        )}
      </Column>
      {message && <Text variant="body-default-s">{message}</Text>}
      {error && (
        <Text onBackground="danger-weak" variant="body-default-s">
          {error}
        </Text>
      )}
    </Column>
  );
}
