"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { orgPath } from "@/lib/orgs/types";
import { Button, Column, Feedback, Heading, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Join the organization with the invitation's role. */
export function AcceptInvite({ token, organization, role }: { token: string; organization: string; role: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/invitations/${token}`, { method: "POST", credentials: "include" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(apiErrorMessage(body, "Could not accept the invitation"));
        return;
      }
      const slug = (body as { organization?: { slug?: string } }).organization?.slug;
      router.push(slug ? orgPath(slug) : "/app");
    } finally {
      setPending(false);
    }
  };

  return (
    <Column fillWidth gap="16">
      <Heading as="h1" variant="heading-strong-l">Join {organization}</Heading>
      <Text onBackground="neutral-weak">You will join as {role === "admin" ? "an admin" : "a member"}.</Text>
      {error && <Feedback variant="danger" description={error} />}
      <Button onClick={() => void accept()} loading={pending}>
        Accept invitation
      </Button>
    </Column>
  );
}
