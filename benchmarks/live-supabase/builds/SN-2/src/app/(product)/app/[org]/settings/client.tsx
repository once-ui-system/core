"use client";

import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { DEMO_ORG_SLUG } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Button, Column, Input, Row, Tag, Text } from "@once-ui-system/core";
import { useCallback, useEffect, useState } from "react";

type OrgInfo = { name: string; plan: "free" | "team"; role: "owner" | "admin" | "member" };

export default function SettingsClient({ org }: { org: string }) {
  const live = isSupabaseConfigured() && org !== DEMO_ORG_SLUG;
  const { refresh } = useOrg();
  const [info, setInfo] = useState<OrgInfo | null>(
    live ? null : { name: "Demo workspace", plan: "free", role: "owner" },
  );
  const [name, setName] = useState(live ? "" : "Demo workspace");
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/orgs/${encodeURIComponent(org)}`;

  const load = useCallback(async () => {
    if (!live) return;
    const res = await fetch(base, { credentials: "include", cache: "no-store" });
    if (!res.ok) {
      setError(apiErrorMessage(await res.json().catch(() => ({})), "Couldn't load the organization"));
      return;
    }
    const data = (await res.json()) as OrgInfo;
    setInfo(data);
    setName(data.name);
  }, [live, base]);

  useEffect(() => {
    void load();
  }, [load]);

  const canManage = info?.role === "owner" || info?.role === "admin";

  const rename = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!live) {
      setError("Connect Supabase to rename organizations.");
      return;
    }
    setSaving(true);
    const res = await fetch(base, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(apiErrorMessage(body, "Couldn't rename the organization"));
      return;
    }
    setMessage("Saved.");
    await refresh();
    await load();
  };

  const upgrade = async () => {
    setError(null);
    if (!live) {
      setError("Connect Supabase and Stripe to upgrade.");
      return;
    }
    setUpgrading(true);
    const res = await fetch(`${base}/billing/checkout`, { method: "POST", credentials: "include" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !(body as { url?: string }).url) {
      setUpgrading(false);
      setError(apiErrorMessage(body, "Couldn't start the checkout"));
      return;
    }
    window.location.assign((body as { url: string }).url);
  };

  return (
    <Column fillWidth gap="24" paddingX="16" maxWidth={32}>
      <form onSubmit={(e) => void rename(e)}>
        <Column fillWidth gap="12">
          <Input
            id="org-name"
            label="Organization name"
            value={name}
            disabled={!canManage}
            onChange={(e) => setName(e.target.value)}
          />
          {!canManage && info && (
            <Text variant="body-default-s" onBackground="neutral-weak">
              Only admins and owners can rename the organization.
            </Text>
          )}
          <Row>
            <Button type="submit" loading={saving} disabled={!canManage || !name.trim()}>
              Save
            </Button>
          </Row>
        </Column>
      </form>

      <Column fillWidth gap="12" padding="20" radius="l" border="neutral-alpha-weak">
        <Row gap="12" vertical="center">
          <Text variant="heading-strong-s">Plan</Text>
          <Tag scheme={info?.plan === "team" ? "brand" : "neutral"} label={info?.plan === "team" ? "Team" : "Free"} />
        </Row>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {info?.plan === "team"
            ? "Your organization is on Team: $8 per member per month."
            : "Free includes up to 3 members. Team is $8 per member per month."}
        </Text>
        {info?.plan !== "team" && canManage && (
          <Row>
            <Button onClick={() => void upgrade()} loading={upgrading}>
              Upgrade to Team
            </Button>
          </Row>
        )}
      </Column>

      {message && <Text onBackground="success-weak">{message}</Text>}
      {error && <Text onBackground="danger-weak">{error}</Text>}
    </Column>
  );
}
