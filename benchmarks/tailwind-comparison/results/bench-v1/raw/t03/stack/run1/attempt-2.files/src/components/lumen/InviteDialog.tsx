"use client";

import { Button, Column, Dialog, Input, Row, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { useLumen } from "./LumenProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteDialog() {
  const { inviteOpen, closeInvite } = useLumen();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    closeInvite();
    setEmail("");
    setError(null);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like name@company.com.");
      return;
    }
    addToast({ variant: "success", message: `Invitation sent to ${value}` });
    close();
  };

  return (
    <Dialog
      open={inviteOpen}
      onClose={close}
      title="Invite a member"
      description="They will get an email with a link to join Acme Labs on Lumen."
    >
      <form onSubmit={submit} noValidate>
        <Column gap="16" paddingTop="8">
          <Input
            id="invite-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            error={error !== null}
            errorMessage={error ?? undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
          />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            New members join as Member. You can change their role later.
          </Text>
          <Row gap="8" horizontal="end">
            <Button type="button" variant="tertiary" label="Cancel" onClick={close} />
            <Button type="submit" label="Send invite" prefixIcon="mail" />
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
