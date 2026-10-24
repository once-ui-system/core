"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { invitationPathFor, orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Button, Column, Heading, Spinner, Tag, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Preview = {
  organization: { name: string; slug: string };
  role: "admin" | "member";
  email: string | null;
  forYou: boolean;
};

type State =
  | { kind: "loading" }
  | { kind: "ready"; preview: Preview }
  | { kind: "error"; message: string }
  | { kind: "off" };

export function InviteClient({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>(() =>
    isSupabaseConfigured() ? { kind: "loading" } : { kind: "off" },
  );
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/invitations/${encodeURIComponent(token)}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (cancelled) return;
      // Signed out: sign in (or up) and come straight back to this link.
      if (res.status === 401) {
        router.replace(`/auth?next=${encodeURIComponent(invitationPathFor(token))}`);
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ kind: "error", message: apiErrorMessage(body, "This invitation can't be opened") });
        return;
      }
      setState({ kind: "ready", preview: body as Preview });
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  const accept = async () => {
    setAccepting(true);
    setAcceptError(null);
    const res = await fetch(`/api/invitations/${encodeURIComponent(token)}`, {
      method: "POST",
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAcceptError(apiErrorMessage(body, "Couldn't accept the invitation"));
      setAccepting(false);
      return;
    }
    // A full navigation, so the workspace switcher loads the new membership.
    window.location.assign(orgPath((body as { organization: { slug: string } }).organization.slug));
  };

  return (
    <Column maxWidth={28} fillWidth gap="20" padding="32" radius="l" border="neutral-alpha-weak" background="surface">
      {state.kind === "loading" && (
        <Column fillWidth center paddingY="32">
          <Spinner />
        </Column>
      )}
      {state.kind === "off" && (
        <>
          <Heading variant="heading-strong-l">Invitations are off</Heading>
          <Text onBackground="neutral-weak">This app is running without a database, so there is nothing to join.</Text>
        </>
      )}
      {state.kind === "error" && (
        <>
          <Heading variant="heading-strong-l">Invitation unavailable</Heading>
          <Text onBackground="neutral-weak">{state.message}</Text>
          <Button href="/app" variant="secondary">Go to your workspace</Button>
        </>
      )}
      {state.kind === "ready" && (
        <>
          <Column gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">You're invited to join</Text>
            <Heading variant="heading-strong-xl">{state.preview.organization.name}</Heading>
            <Tag scheme="neutral" label={state.preview.role === "admin" ? "as an admin" : "as a member"} />
          </Column>
          {state.preview.forYou ? (
            <Button onClick={() => void accept()} loading={accepting} fillWidth>
              Accept invitation
            </Button>
          ) : (
            <Text onBackground="danger-weak" variant="body-default-s">
              This invitation was sent to {state.preview.email}. Sign in with that address, with
              its email confirmed, to accept it.
            </Text>
          )}
          {acceptError && (
            <Text onBackground="danger-weak" variant="body-default-s">{acceptError}</Text>
          )}
        </>
      )}
    </Column>
  );
}
