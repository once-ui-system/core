"use client";

import { Button, Column, Text } from "@once-ui-system/core";
import { useState } from "react";

// Asks the checkout API for a Stripe Checkout URL and sends the browser there.
export function UpgradeButton({ org }: { org: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(org)}/billing/checkout`, { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        setError(body.error ?? "Checkout could not be started.");
        setPending(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Checkout could not be started.");
      setPending(false);
    }
  }

  return (
    <Column gap="8" horizontal="start">
      <Button label="Upgrade to Team" onClick={upgrade} loading={pending} />
      {error && (
        <Text variant="body-default-s" onBackground="danger-strong" role="alert">
          {error}
        </Text>
      )}
    </Column>
  );
}
