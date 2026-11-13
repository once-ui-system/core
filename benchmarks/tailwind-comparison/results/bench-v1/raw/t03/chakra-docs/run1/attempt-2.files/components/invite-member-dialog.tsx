"use client";

import * as React from "react";
import { Button, Input, Text } from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogActionTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { useAppShell } from "@/components/app-shell-provider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMemberDialog() {
  const { inviteOpen, setInviteOpen } = useAppShell();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!inviteOpen) {
      setEmail("");
      setError(null);
    }
  }, [inviteOpen]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like teammate@acmelabs.io.");
      inputRef.current?.focus();
      return;
    }
    setInviteOpen(false);
    toaster.create({
      title: "Invitation sent",
      description: `${value} will receive an email to join Acme Labs on Lumen.`,
      type: "success",
    });
  }

  return (
    <DialogRoot
      open={inviteOpen}
      onOpenChange={(details) => setInviteOpen(details.open)}
      placement="center"
      initialFocusEl={() => inputRef.current}
    >
      <DialogContent mx="4">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription asChild>
              <Text color="fg.muted" mb="4" textStyle="sm">
                They will get an email with a link to join your workspace as a Member.
              </Text>
            </DialogDescription>
            <Field label="Email address" invalid={!!error} errorText={error} required>
              <Input
                ref={inputRef}
                type="email"
                name="email"
                autoComplete="off"
                placeholder="teammate@acmelabs.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
