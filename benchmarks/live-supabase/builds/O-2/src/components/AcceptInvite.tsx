"use client";

import { Button, Column, Heading, Text } from "@once-ui-system/core";
import { useState } from "react";

export function AcceptInvite({ token, demo }: { token: string; demo: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function accept() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/invitations/${encodeURIComponent(token)}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) window.location.assign(`/app/${data.org}`);
    else {
      setError(data.error ?? "Could not join");
      setBusy(false);
    }
  }
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth={28} fillWidth background="surface" border radius="l" padding="32" gap="24">
        <Heading as="h1" variant="heading-strong-xl">
          You are invited
        </Heading>
        <Text>Join the organization on Acme Notes.</Text>
        {error && <Text role="alert" onBackground="danger-strong">{error}</Text>}
        <Button onClick={accept} loading={busy} disabled={demo} label="Accept invitation" />
      </Column>
    </Column>
  );
}
