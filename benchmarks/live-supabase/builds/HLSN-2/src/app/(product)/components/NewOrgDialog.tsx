"use client";

import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { slugify } from "@/lib/orgs/slug";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Button, Column, Dialog, Feedback, Input, Row, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The form that creates an organization. The owner is the signed-in user.
 * `POST /api/orgs` answers 201 with `{ id, slug, name }`; a name whose address
 * is taken gets a suffix, so the form never shows a collision to the user.
 */
export function NewOrgForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const { refresh } = useOrg();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured, so organizations cannot be created.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(apiErrorMessage(body, "Could not create the organization"));
        return;
      }
      const created = body as { slug: string };
      await refresh();
      onCreated?.();
      router.push(orgPath(created.slug));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)}>
      <Column fillWidth gap="16">
        <Input
          id="new-org-name"
          label="Organization name"
          required
          maxLength={64}
          value={name}
          onChange={(event) => setName(event.target.value)}
          description={name.trim() ? `Address: /app/${slugify(name) || "…"}` : undefined}
        />
        {error && <Feedback variant="danger" description={error} />}
        <Row horizontal="end">
          <Button type="submit" loading={saving} disabled={!name.trim()}>
            Create organization
          </Button>
        </Row>
      </Column>
    </form>
  );
}

/** The same form in a dialog, opened from the workspace switcher. */
export function NewOrgDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="New organization" description="A shared workspace you can invite people to.">
      <NewOrgForm onCreated={onClose} />
    </Dialog>
  );
}

/** Shown in place of a workspace when the signed-in user has none yet. */
export function NoWorkspace() {
  return (
    <Column fillWidth gap="16" paddingY="32" maxWidth="s">
      <Text variant="heading-strong-l">Create your first organization</Text>
      <Text variant="body-default-m" onBackground="neutral-weak">
        Organizations hold shared notebooks. You become its owner and can invite people by link.
      </Text>
      <NewOrgForm />
    </Column>
  );
}
