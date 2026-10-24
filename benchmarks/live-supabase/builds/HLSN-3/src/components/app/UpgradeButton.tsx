"use client";

import { Button, Column, Text } from "@once-ui-system/core";
import { useState } from "react";
import { apiErrorMessage } from "@/lib/api-error";

/** Starts a Stripe Checkout for the Team plan and follows its URL. */
export function UpgradeButton({ orgSlug }: { orgSlug: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgrade = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${orgSlug}/billing/checkout`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.url) {
        setError(apiErrorMessage(body, "Could not start checkout"));
        setBusy(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Could not start checkout");
      setBusy(false);
    }
  };

  return (
    <Column gap="8" maxWidth="s">
      <Button label="Upgrade to Team" loading={busy} disabled={busy} onClick={upgrade} />
      {error && (
        <Text variant="body-default-s" onBackground="danger-strong" role="alert">
          {error}
        </Text>
      )}
    </Column>
  );
}
