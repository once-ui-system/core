"use client";

import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { Button, Column, Heading, Input, Row, Tag, Text, useToast } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsClient({
  org,
  demo,
  name: initialName,
  plan,
  canManage,
}: {
  org: string;
  demo: boolean;
  name: string;
  plan: "free" | "team";
  canManage: boolean;
}) {
  const router = useRouter();
  const { refresh } = useOrg();
  const { addToast } = useToast();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "success") addToast({ variant: "success", message: "Thank you! Your plan will update in a moment." });
    if (checkout === "cancelled") addToast({ variant: "info", message: "Checkout cancelled. Nothing was charged." });
    if (checkout) window.history.replaceState(window.history.state, "", window.location.pathname);
  }, [addToast]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demo) {
      addToast({ variant: "info", message: "Supabase is not configured, so changes are off." });
      return;
    }
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
    router.refresh();
  };

  const upgrade = async () => {
    if (demo) {
      addToast({ variant: "info", message: "Supabase is not configured, so billing is off." });
      return;
    }
    setUpgrading(true);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing/checkout`, {
      method: "POST",
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setUpgrading(false);
      addToast({ variant: "danger", message: apiErrorMessage(body, "Couldn't start checkout") });
      return;
    }
    window.location.assign((body as { url: string }).url);
  };

  return (
    <Column fillWidth gap="24">
      <Heading as="h1" variant="display-strong-s" paddingLeft="16">
        Settings
      </Heading>

      <Column fillWidth gap="16" padding="24" radius="l" border="neutral-alpha-medium" background="surface">
        <Heading as="h2" variant="heading-strong-m">
          Organization name
        </Heading>
        <form onSubmit={(e) => void save(e)}>
          <Row gap="8" vertical="center" s={{ direction: "column", vertical: "start" }}>
            <Input
              id="org-name"
              label="Name"
              value={name}
              disabled={!canManage}
              onChange={(e) => setName(e.target.value)}
              maxLength={64}
            />
            {canManage && (
              <Button type="submit" loading={saving} disabled={!name.trim() || name === initialName}>
                Save
              </Button>
            )}
          </Row>
        </form>
        {!canManage && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Only owners and admins can rename the organization.
          </Text>
        )}
      </Column>

      <Column fillWidth gap="16" padding="24" radius="l" border="neutral-alpha-medium" background="surface">
        <Row gap="12" vertical="center">
          <Heading as="h2" variant="heading-strong-m">
            Plan
          </Heading>
          <Tag size="s" scheme="brand" label={plan === "team" ? "Team" : "Free"} />
        </Row>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {plan === "team"
            ? "Your organization is on the Team plan: $8 per member per month."
            : "Free covers up to 3 members. Team is $8 per member per month."}
        </Text>
        {plan === "free" && canManage && (
          <Row>
            <Button loading={upgrading} onClick={() => void upgrade()}>
              Upgrade to Team
            </Button>
          </Row>
        )}
        {plan === "free" && !canManage && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Only owners and admins can change the plan.
          </Text>
        )}
      </Column>
    </Column>
  );
}
