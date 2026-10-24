"use client";

import { useOrg } from "@/components/OrgProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { slugify } from "@/lib/orgs/slug";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Button, Column, Dialog, Input, Row, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Create an organization from the workspace switcher. The address is derived
 * from the name until someone edits it, and is checked by the server either
 * way (`POST /api/orgs` answers 409 when it is taken).
 */
export function NewOrgDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { refresh } = useOrg();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = slugEdited ? slug : slugify(name);

  const close = () => {
    setName("");
    setSlug("");
    setSlugEdited(false);
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setError("Connect Supabase to create organizations.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/orgs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: address }),
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
    <Dialog open={open} onClose={close} title="New organization" description="A shared workspace you can invite people to.">
      <form onSubmit={(e) => void submit(e)}>
        <Column fillWidth gap="16">
          <Input id="new-org-name" label="Name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={64} />
          <Input
            id="new-org-slug"
            label="Address"
            value={address}
            prefix={<Text variant="body-default-s" onBackground="neutral-weak">/app/</Text>}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase());
            }}
            error={error ? true : undefined}
            errorMessage={error ?? undefined}
          />
          <Row horizontal="end" gap="8">
            <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
            <Button type="submit" loading={saving} disabled={!name.trim() || !address}>Create</Button>
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
