"use client";

import { Button, Column, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiErrorMessage } from "@/lib/api-error";

/** Joins the signed-in user to the organization the invitation names. */
export function AcceptInvite({ token, orgName }: { token: string; orgName: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/invitations/${token}`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.slug) {
        setError(apiErrorMessage(body, "Could not accept the invitation"));
        return;
      }
      router.replace(`/app/${body.slug}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Column gap="16">
      <Text variant="body-default-m" onBackground="neutral-medium">
        {orgName ? `You have been invited to join ${orgName}.` : "You have been invited to join an organization."}
      </Text>
      <Button label="Join organization" loading={busy} disabled={busy} onClick={accept} />
      {error && (
        <Text variant="body-default-s" onBackground="danger-strong" role="alert">
          {error}
        </Text>
      )}
    </Column>
  );
}
