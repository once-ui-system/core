"use client";

import { Button, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinOrganization({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/invitations/${token}`, { method: "POST" });
    const body = (await response.json().catch(() => ({}))) as { slug?: string; error?: string };
    if (!response.ok || !body.slug) {
      setPending(false);
      setError(body.error ?? "The invitation could not be used.");
      return;
    }
    router.push(`/app/${body.slug}`);
  }

  return (
    <>
      <Button label="Join organization" loading={pending} onClick={join} fillWidth />
      {error ? (
        <Text variant="body-default-s" onBackground="danger-medium" role="alert">
          {error}
        </Text>
      ) : null}
    </>
  );
}
