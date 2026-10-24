"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { Button, Column, Feedback, Input, Row } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Rename the organization. Owners and admins; the server checks the role again. */
export function RenameForm({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/orgs/${slug}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(apiErrorMessage(body, "Could not rename the organization"));
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)}>
      <Column fillWidth gap="16">
        <Input id="org-name" label="Organization name" required maxLength={64} value={value} onChange={(event) => setValue(event.target.value)} />
        {error && <Feedback variant="danger" description={error} />}
        {saved && <Feedback variant="success" description="Saved." />}
        <Row horizontal="end">
          <Button type="submit" loading={saving} disabled={!value.trim() || value.trim() === name}>
            Save name
          </Button>
        </Row>
      </Column>
    </form>
  );
}

/** Start a Stripe Checkout for the Team plan, then follow it. */
export function UpgradeButton({ slug, disabledReason }: { slug: string; disabledReason?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgrade = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/orgs/${slug}/billing/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || typeof (body as { url?: unknown }).url !== "string") {
        setError(apiErrorMessage(body, "Could not start the upgrade"));
        return;
      }
      window.location.href = (body as { url: string }).url;
    } finally {
      setPending(false);
    }
  };

  return (
    <Column fillWidth gap="8">
      <Row>
        <Button onClick={() => void upgrade()} loading={pending} disabled={Boolean(disabledReason)}>
          Upgrade to Team
        </Button>
      </Row>
      {disabledReason && <Feedback variant="info" description={disabledReason} />}
      {error && <Feedback variant="danger" description={error} />}
    </Column>
  );
}
