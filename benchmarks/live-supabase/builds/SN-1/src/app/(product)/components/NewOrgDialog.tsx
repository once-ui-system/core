"use client";

import { Button, Column, Dialog, Input, Row } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";

/** Create an organization from the switcher; the address is made from the name. */
export function NewOrgDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { refresh } = useOrg();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setName("");
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured, so organizations can't be created.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/orgs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(apiErrorMessage(body, "Couldn't create the organization"));
      return;
    }
    const created = body as { slug: string };
    await refresh();
    close();
    router.push(orgPath(created.slug));
  };

  return (
    <Dialog open={open} onClose={close} title="New organization" description="A shared space for your team's notes.">
      <form onSubmit={(e) => void submit(e)}>
        <Column fillWidth gap="16">
          <Input
            id="new-org-name"
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            error={error ? true : undefined}
            errorMessage={error ?? undefined}
          />
          <Row horizontal="end" gap="8">
            <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
            <Button type="submit" loading={saving} disabled={!name.trim()}>Create</Button>
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
