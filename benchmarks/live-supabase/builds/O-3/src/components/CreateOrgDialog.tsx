"use client";

import { Button, Column, Dialog, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateOrgDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setName("");
      onClose();
      router.push(`/app/${body.slug}`);
      router.refresh();
    } else setError(body.error ?? "Could not create the organization.");
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create organization" description="Organizations hold your team's notebooks and members.">
      <form onSubmit={submit}>
        <Column gap="16">
          <Input id="org-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          {error && (
            <Text role="alert" onBackground="danger-medium">
              {error}
            </Text>
          )}
          <Button type="submit" loading={busy} label="Create" />
        </Column>
      </form>
    </Dialog>
  );
}
