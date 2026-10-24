"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Column, Feedback, Input } from "@once-ui-system/core";

/** Renames the organization. Shown only to owners and admins. */
export function RenameForm({ slug, name, demo }: { slug: string; name: string; demo: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (demo || busy) return;

    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(body.message ?? "Could not rename the organization. Try again.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Column gap="16" maxWidth="s">
        <Input
          id="org-rename"
          name="name"
          label="Organization name"
          required
          maxLength={80}
          value={value}
          disabled={demo}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button type="submit" variant="primary" label="Save name" loading={busy} disabled={demo} />
        {saved && <Feedback variant="success" description="Name saved." />}
        {error && <Feedback variant="danger" description={error} />}
      </Column>
    </form>
  );
}
