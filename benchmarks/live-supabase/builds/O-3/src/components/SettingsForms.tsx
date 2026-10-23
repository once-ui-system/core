"use client";

import { Button, Column, Heading, Input, Tag, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SettingsForms({ org, name: initial, plan }: { org: string; name: string; plan: "free" | "team" }) {
  const router = useRouter();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [billingError, setBillingError] = useState("");

  async function rename(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else setError(body.error ?? "Could not rename.");
  }

  async function upgrade() {
    setUpgrading(true);
    setBillingError("");
    const res = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing/checkout`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.url) window.location.assign(body.url);
    else {
      setBillingError(body.error ?? "Could not start checkout.");
      setUpgrading(false);
    }
  }

  return (
    <>
      <Column background="page" border radius="l" padding="24" gap="16">
        <Heading variant="heading-strong-l" as="h2">
          Organization name
        </Heading>
        <form onSubmit={rename}>
          <Column gap="16">
            <Input id="org-rename" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            {error && (
              <Text role="alert" onBackground="danger-medium">
                {error}
              </Text>
            )}
            {saved && <Text onBackground="brand-medium">Saved.</Text>}
            <Button type="submit" loading={busy} label="Save" />
          </Column>
        </form>
      </Column>
      <Column background="page" border radius="l" padding="24" gap="16">
        <Heading variant="heading-strong-l" as="h2">
          Billing
        </Heading>
        <Tag scheme={plan === "team" ? "brand" : "neutral"} label={plan === "team" ? "Team plan" : "Free plan"} />
        {plan === "free" ? (
          <>
            <Text onBackground="neutral-weak">Upgrade to Team for $8 per member per month.</Text>
            <Button onClick={upgrade} loading={upgrading} label="Upgrade to Team" />
          </>
        ) : (
          <Text onBackground="neutral-weak">This organization is on the Team plan.</Text>
        )}
        {billingError && (
          <Text role="alert" onBackground="danger-medium">
            {billingError}
          </Text>
        )}
      </Column>
    </>
  );
}
