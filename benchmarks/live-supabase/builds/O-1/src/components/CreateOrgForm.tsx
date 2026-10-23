"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateOrgForm({ demo, onDone }: { demo?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not create the organization");
      onDone?.();
      router.push(`/app/${body.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Column gap="16">
        <Input id="org-name" label="Organization name" value={name} onChange={(e) => setName(e.target.value)} required />
        {error && (
          <Text role="alert" onBackground="danger-medium" variant="body-default-s">
            {error}
          </Text>
        )}
        {demo && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Demo mode: organizations cannot be created until Supabase is configured.
          </Text>
        )}
        <Button type="submit" loading={busy} disabled={demo} label="Create organization" />
      </Column>
    </form>
  );
}
