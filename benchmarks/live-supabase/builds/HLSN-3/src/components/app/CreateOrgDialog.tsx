"use client";

import { Button, Column, Dialog, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiErrorMessage } from "@/lib/api-error";

/** The create-organization dialog. Posts to /api/orgs and opens the new organization. */
export function CreateOrgDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(apiErrorMessage(body, "Could not create the organization"));
        return;
      }
      setName("");
      onClose();
      router.push(`/app/${body.slug}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create organization">
      <Column as="form" gap="16" onSubmit={submit}>
        <Input
          id="org-name"
          name="name"
          label="Organization name"
          required
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {error && (
          <Text variant="body-default-s" onBackground="danger-strong" role="alert">
            {error}
          </Text>
        )}
        <Button type="submit" label="Create" fillWidth loading={busy} disabled={busy || !name.trim()} />
      </Column>
    </Dialog>
  );
}
