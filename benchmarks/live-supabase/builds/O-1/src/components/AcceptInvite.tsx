"use client";

import { Button, Column, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AcceptInvite({ token, demo }: { token: string; demo: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/invitations/${token}`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not join");
      router.push(`/app/${body.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <Column gap="16">
      {error && (
        <Text role="alert" onBackground="danger-medium">
          {error}
        </Text>
      )}
      {demo && <Text onBackground="neutral-weak">Demo mode: invitations need Supabase.</Text>}
      <Button onClick={accept} loading={busy} disabled={demo} label="Join organization" />
    </Column>
  );
}
