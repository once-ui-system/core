"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RenameForm({ slug, name, canEdit, demo }: { slug: string; name: string; canEdit: boolean; demo: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/orgs/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not rename");
      setMsg("Saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Column gap="16" maxWidth="s">
        <Input id="rename" label="Organization name" value={value} onChange={(e) => setValue(e.target.value)} disabled={!canEdit} required />
        {!canEdit && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Only owners and admins can rename the organization.
          </Text>
        )}
        {error && (
          <Text role="alert" onBackground="danger-medium" variant="body-default-s">
            {error}
          </Text>
        )}
        {msg && <Text role="status" variant="body-default-s" onBackground="brand-medium">{msg}</Text>}
        <Button type="submit" loading={busy} disabled={!canEdit || demo} label="Save name" />
      </Column>
    </form>
  );
}

export function UpgradeButton({ slug, plan, canEdit, demo }: { slug: string; plan: string; canEdit: boolean; demo: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (plan === "team") return <Text onBackground="neutral-weak">This organization is on the Team plan.</Text>;
  if (!canEdit) return <Text onBackground="neutral-weak" variant="body-default-s">Only owners and admins can upgrade.</Text>;

  async function go() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/orgs/${slug}/billing/checkout`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) throw new Error(body.error ?? "Could not start checkout");
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <Column gap="8" maxWidth="s">
      {error && (
        <Text role="alert" onBackground="danger-medium" variant="body-default-s">
          {error}
        </Text>
      )}
      <Button onClick={go} loading={busy} disabled={demo} label="Upgrade to Team ($8 per member per month)" />
    </Column>
  );
}
