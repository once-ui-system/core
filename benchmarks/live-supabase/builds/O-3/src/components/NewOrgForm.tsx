"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewOrgForm() {
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
    if (res.ok) router.push(`/app/${body.slug}`);
    else {
      setError(body.error ?? "Could not create the organization.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Column gap="16">
        <Input id="new-org" label="Organization name" value={name} onChange={(e) => setName(e.target.value)} required />
        {error && (
          <Text role="alert" onBackground="danger-medium">
            {error}
          </Text>
        )}
        <Button type="submit" loading={busy} label="Create organization" />
      </Column>
    </form>
  );
}
