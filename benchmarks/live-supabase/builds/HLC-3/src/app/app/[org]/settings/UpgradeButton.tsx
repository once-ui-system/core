"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Opens the Stripe Checkout page for the Team plan.
export function UpgradeButton({ slug }: { slug: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upgrade() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${encodeURIComponent(slug)}/billing/checkout`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) throw new Error(body.error ?? "Could not start checkout");
      window.location.assign(body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={upgrade} disabled={busy}>
        {busy ? "Opening checkout..." : "Upgrade to Team"}
      </Button>
    </div>
  );
}
