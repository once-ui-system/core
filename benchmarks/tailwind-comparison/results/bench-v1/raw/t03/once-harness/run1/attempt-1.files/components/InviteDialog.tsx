"use client";

import { Button, Column, Dialog, Input, Row, useToast } from "@once-ui-system/core";
import { useEffect, useState } from "react";
import { members } from "@/lib/data";
import { usePalette } from "./PaletteProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteDialog() {
  const { inviteOpen, closeInvite } = usePalette();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteOpen) {
      setEmail("");
      setError(null);
    }
  }, [inviteOpen]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like teammate@acmelabs.io.");
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === value.toLowerCase())) {
      setError("That person is already a member of this workspace.");
      return;
    }
    addToast({ tone: "success", message: `Invitation sent to ${value}` });
    closeInvite();
  };

  return (
    <Dialog
      open={inviteOpen}
      onClose={closeInvite}
      title="Invite member"
      description="They will get an email with a link to join Acme Labs on Lumen."
    >
      <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <Input
          id="invite-email"
          type="email"
          label="Email address"
          placeholder="teammate@acmelabs.io"
          value={email}
          autoComplete="off"
          error={error !== null}
          errorMessage={error ?? undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
        />
        <Row gap="12" horizontal="end">
          <Button type="button" variant="secondary" label="Cancel" onClick={closeInvite} />
          <Button type="submit" label="Send invite" prefixIcon="send" />
        </Row>
      </form>
    </Dialog>
  );
}
