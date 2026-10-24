"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiErrorMessage } from "@/lib/api-error";

/** Renames the organization. Owners and admins only; the server checks the role again. */
export function RenameOrgForm({ orgSlug, name, disabled }: { orgSlug: string; name: string; disabled: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/orgs/${orgSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(apiErrorMessage(body, "Could not rename the organization"));
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Column as="form" gap="16" maxWidth="s" onSubmit={submit}>
      <Input
        id="rename-org"
        name="name"
        label="Organization name"
        required
        maxLength={80}
        disabled={disabled}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {error && (
        <Text variant="body-default-s" onBackground="danger-strong" role="alert">
          {error}
        </Text>
      )}
      {saved && (
        <Text variant="body-default-s" onBackground="success-strong" role="status">
          Saved.
        </Text>
      )}
      <Button type="submit" label="Save name" loading={busy} disabled={disabled || busy || !value.trim()} />
    </Column>
  );
}
