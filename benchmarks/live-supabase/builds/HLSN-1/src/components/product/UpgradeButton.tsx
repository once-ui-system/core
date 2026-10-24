"use client";

import { useState } from "react";
import { Button, Feedback } from "@once-ui-system/core";

/** Starts the Team checkout and sends the browser to Stripe. */
export function UpgradeButton({ slug, demo }: { slug: string; demo: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    if (demo || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(slug)}/billing/checkout`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => ({}))) as { url?: string; message?: string };
      if (!response.ok || !body.url) {
        setError(body.message ?? "Could not start the upgrade. Try again.");
        setBusy(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Could not reach the server. Try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="primary" label="Upgrade to Team" loading={busy} disabled={demo} onClick={upgrade} />
      {error && <Feedback variant="danger" description={error} />}
    </>
  );
}
