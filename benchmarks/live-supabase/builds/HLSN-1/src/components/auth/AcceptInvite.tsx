"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Column, Feedback, Heading, Text } from "@once-ui-system/core";

/** Joins the signed-in user to the invitation's organization. */
export function AcceptInvite({
  token,
  name,
  slug,
  role,
}: {
  token: string;
  name: string;
  slug: string;
  role: "admin" | "member";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/invitations/${encodeURIComponent(token)}`, { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as { slug?: string; message?: string };
      if (!response.ok || !body.slug) {
        setError(body.message ?? "Could not join the organization. Try again.");
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
    <Column gap="16">
      <Heading as="h1" variant="display-strong-xs">Join {name}</Heading>
      <Text variant="body-default-m" onBackground="neutral-weak">
        You will join {name} as {role === "admin" ? "an admin" : "a member"}.
      </Text>
      <Button variant="primary" label={`Join ${name}`} loading={busy} onClick={join} />
      {error && <Feedback variant="danger" description={error} />}
      <Text variant="body-default-s" onBackground="neutral-weak">
        Your organization is {slug}. Accepting adds you to it; you can leave by asking an owner.
      </Text>
    </Column>
  );
}
