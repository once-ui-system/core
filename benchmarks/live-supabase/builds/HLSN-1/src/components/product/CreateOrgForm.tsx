"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Column, Feedback, Heading, Input, Text } from "@once-ui-system/core";

/** Creates an organization and opens it. The creator becomes its owner. */
export function CreateOrgForm({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (demo || busy) return;

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = (await response.json().catch(() => ({}))) as { slug?: string; message?: string };
      if (!response.ok || !body.slug) {
        setError(body.message ?? "Could not create the organization. Try again.");
        return;
      }
      router.replace(`/app/${body.slug}`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Column gap="24" maxWidth="s">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Create an organization
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          An organization holds your team's notebooks and members. You become its owner.
        </Text>
      </Column>
      {demo && (
        <Feedback
          variant="warning"
          title="Supabase is not configured"
          description="Demo mode has one sample organization. Set the Supabase variables to create your own."
        />
      )}
      <form onSubmit={submit}>
        <Column gap="16">
          <Input
            id="org-name"
            name="name"
            label="Organization name"
            required
            maxLength={80}
            value={name}
            disabled={demo}
            onChange={(event) => setName(event.target.value)}
          />
          <Button type="submit" variant="primary" label="Create organization" loading={busy} disabled={demo} />
        </Column>
      </form>
      {error && <Feedback variant="danger" description={error} />}
    </Column>
  );
}
