"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateOrgForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    setError(null);
    setPending(true);
    const response = await fetch("/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = (await response.json().catch(() => ({}))) as { slug?: string; error?: string };
    if (!response.ok || !body.slug) {
      setPending(false);
      setError(body.error ?? "The organization could not be created.");
      return;
    }
    router.push(`/app/${body.slug}`);
  }

  return (
    <Column gap="24" background="surface" border radius="l" padding="24" fillWidth>
      <form onSubmit={submit}>
        <Column gap="16">
          <Input id="org-name" name="name" label="Organization name" maxLength={80} required />
          {error ? (
            <Text variant="body-default-s" onBackground="danger-medium" role="alert">
              {error}
            </Text>
          ) : null}
          <Button type="submit" label="Create organization" loading={pending} fillWidth />
        </Column>
      </form>
    </Column>
  );
}
