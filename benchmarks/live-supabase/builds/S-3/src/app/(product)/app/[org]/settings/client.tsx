"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import type { OrgPlan } from "@/lib/orgs/types";
import { Button, Column, Heading, Input, Row, Tag, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  org: string;
  name: string;
  plan: OrgPlan;
  /** Owners and admins. */
  canManage: boolean;
  /** False in demo mode, where nothing can be saved. */
  live: boolean;
}

export default function SettingsClient({ org, name, plan, canManage, live }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  const editable = canManage && live;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMessage({ error: true, text: apiErrorMessage(body, "Couldn't rename the organization") });
      return;
    }
    setMessage({ error: false, text: "Saved." });
    router.refresh();
  };

  const upgrade = async () => {
    setUpgrading(true);
    setMessage(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing/checkout`, {
      method: "POST",
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || typeof (body as { url?: unknown }).url !== "string") {
      setUpgrading(false);
      setMessage({ error: true, text: apiErrorMessage(body, "Couldn't start checkout") });
      return;
    }
    window.location.assign((body as { url: string }).url);
  };

  return (
    <Column gap="16" maxWidth="s">
      <Column fillWidth gap="16" padding="20" radius="l" border="neutral-alpha-weak" background="surface">
        <Heading as="h2" variant="heading-strong-l">
          Organization
        </Heading>
        <form onSubmit={(e) => void save(e)}>
          <Column fillWidth gap="12">
            <Input
              id="org-name"
              label="Name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!editable}
              maxLength={64}
            />
            {!canManage && (
              <Text variant="body-default-s" onBackground="neutral-weak">
                Only owners and admins can rename the organization.
              </Text>
            )}
            {!live && (
              <Text variant="body-default-s" onBackground="neutral-weak">
                Saving needs Supabase, which is not configured.
              </Text>
            )}
            <Row>
              <Button type="submit" loading={saving} disabled={!editable || !value.trim() || value === name}>
                Save
              </Button>
            </Row>
          </Column>
        </form>
      </Column>

      <Column fillWidth gap="12" padding="20" radius="l" border="neutral-alpha-weak" background="surface">
        <Row gap="12" vertical="center">
          <Heading as="h2" variant="heading-strong-l">
            Plan
          </Heading>
          <Tag scheme={plan === "team" ? "brand" : "neutral"} label={plan === "team" ? "Team" : "Free"} />
        </Row>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {plan === "team"
            ? "Team: $8 per member per month."
            : "Free: up to 3 members. Team is $8 per member per month."}
        </Text>
        {plan !== "team" && canManage && (
          <Row>
            <Button onClick={() => void upgrade()} loading={upgrading} disabled={!live}>
              Upgrade to Team
            </Button>
          </Row>
        )}
      </Column>

      {message && (
        <Text variant="body-default-s" onBackground={message.error ? "danger-weak" : "success-weak"}>
          {message.text}
        </Text>
      )}
    </Column>
  );
}
