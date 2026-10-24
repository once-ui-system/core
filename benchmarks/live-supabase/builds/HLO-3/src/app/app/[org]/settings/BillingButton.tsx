"use client";

import { Button, Text } from "@once-ui-system/core";
import { useState } from "react";

// Starts a Stripe Checkout session for the Team plan and follows its URL.
export function BillingButton({ slug }: { slug: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/orgs/${slug}/billing/checkout`, { method: "POST" });
    const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!response.ok || !body.url) {
      setPending(false);
      setError(body.error ?? "Checkout could not be started.");
      return;
    }
    window.location.assign(body.url);
  }

  return (
    <>
      <Button label="Upgrade to Team" loading={pending} onClick={upgrade} />
      {error ? (
        <Text variant="body-default-s" onBackground="danger-medium" role="alert">
          {error}
        </Text>
      ) : null}
    </>
  );
}
