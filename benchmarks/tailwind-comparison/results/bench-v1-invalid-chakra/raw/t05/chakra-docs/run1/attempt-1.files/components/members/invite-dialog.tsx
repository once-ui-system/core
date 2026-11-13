"use client";

import { useState } from "react";
import { Button, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { INVITE_ROLES, type Role, isValidEmail } from "@/lib/data";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
}

interface Errors {
  email?: string;
  role?: string;
}

export function InviteDialog({ open, onOpenChange, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function validate(): Errors {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Enter an email address.";
    else if (!isValidEmail(trimmed)) next.email = "Enter a valid email address, like name@company.com.";
    if (!role) next.role = "Choose a role for the new member.";
    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInvite({ email: email.trim(), role: role as Role, message: message.trim() });
    reset();
    onOpenChange(false);
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => {
        onOpenChange(details.open);
        if (!details.open) reset();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <DialogContent mx="4">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription mb="4">
              They&apos;ll get an email with a link to join your Lumen workspace.
            </DialogDescription>
            <Stack gap="4">
              <Field
                label="Email"
                required
                invalid={!!errors.email}
                errorText={errors.email}
              >
                <Input
                  type="email"
                  name="email"
                  autoComplete="off"
                  placeholder="teammate@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field
                label="Role"
                required
                invalid={!!errors.role}
                errorText={errors.role}
              >
                <NativeSelectRoot>
                  <NativeSelectField
                    name="role"
                    placeholder="Select a role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    items={INVITE_ROLES}
                  />
                </NativeSelectRoot>
              </Field>
              <Field label="Message" optionalText={<Text as="span" color="fg.muted" fontSize="sm">(optional)</Text>}>
                <Textarea
                  name="message"
                  rows={3}
                  placeholder="Add a short note, e.g. what they'll be working on."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button type="submit" colorPalette="blue">
              Send invite
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
