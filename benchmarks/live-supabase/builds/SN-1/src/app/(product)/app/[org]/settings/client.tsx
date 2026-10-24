"use client";

import { Button, Column, Heading, Input, Row, Text, useToast } from "@once-ui-system/core";
import { useEffect, useState } from "react";
import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { DEMO_ORG_SLUG } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { schema } from "@/resources";

/** Rename the organization (admins and owners) and upgrade its plan. */
export default function SettingsClient() {
  const configured = isSupabaseConfigured();
  const { slug, selected, refresh } = useOrg();
  const { addToast } = useToast();
  const org = slug ?? DEMO_ORG_SLUG;

  const role = configured ? (selected?.role ?? "member") : "owner";
  const canAdmin = role === "owner" || role === "admin";
  const plan = selected?.plan ?? "free";

  const [name, setName] = useState(selected?.name ?? schema.name);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (selected) setName(selected.name);
  }, [selected]);

  const demoOnly = () => addToast({ variant: "info", message: "Supabase is not configured, so this is off." });

  const save = async () => {
    if (!configured) return demoOnly();
    setSaving(true);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      addToast({ variant: "danger", message: apiErrorMessage(body, "Couldn't rename the organization") });
      return;
    }
    addToast({ variant: "success", message: "Organization renamed" });
    await refresh();
  };

  const upgrade = async () => {
    if (!configured) return demoOnly();
    setUpgrading(true);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing/checkout`, {
      method: "POST",
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || typeof (body as { url?: unknown }).url !== "string") {
      setUpgrading(false);
      addToast({ variant: "danger", message: apiErrorMessage(body, "Couldn't start the checkout") });
      return;
    }
    window.location.assign((body as { url: string }).url);
  };

  return (
    <Column fillWidth gap="24" paddingX="16" maxWidth="m">
      <Heading variant="display-strong-s">Settings</Heading>

      <Column fillWidth gap="12" padding="20" radius="l" border="neutral-alpha-medium" background="surface">
        <Heading as="h2" variant="heading-strong-m">
          Name
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {canAdmin ? "Shown in the organization switcher." : "Only owners and admins can rename the organization."}
        </Text>
        <Row gap="8" vertical="center">
          <Input id="org-name" value={name} disabled={!canAdmin} onChange={(e) => setName(e.target.value)} maxLength={64} />
          {canAdmin && (
            <Button label="Save" loading={saving} disabled={!name.trim() || name === selected?.name} onClick={() => void save()} />
          )}
        </Row>
      </Column>

      <Column fillWidth gap="12" padding="20" radius="l" border="neutral-alpha-medium" background="surface">
        <Heading as="h2" variant="heading-strong-m">
          Plan
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {plan === "team"
            ? "This organization is on the Team plan ($8 per member per month)."
            : "This organization is on the Free plan (up to 3 members). Team is $8 per member per month."}
        </Text>
        {plan === "free" && canAdmin && (
          <Row>
            <Button label="Upgrade to Team" loading={upgrading} onClick={() => void upgrade()} />
          </Row>
        )}
      </Column>
    </Column>
  );
}
