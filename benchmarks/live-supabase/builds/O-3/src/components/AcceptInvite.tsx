"use client";

import { Button, Column, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/invitations/${encodeURIComponent(token)}`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/app/${body.org.slug}`);
    else {
      setError(body.error ?? "Could not accept the invitation.");
      setBusy(false);
    }
  }

  return (
    <Column gap="12">
      <Button onClick={accept} loading={busy} label="Accept invitation" />
      {error && (
        <Text role="alert" onBackground="danger-medium">
          {error}
        </Text>
      )}
    </Column>
  );
}
