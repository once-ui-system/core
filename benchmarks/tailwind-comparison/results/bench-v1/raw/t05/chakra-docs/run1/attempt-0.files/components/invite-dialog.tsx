"use client";

import { useState } from "react";
import { Button, Input, Stack, Textarea } from "@chakra-ui/react";
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
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { ASSIGNABLE_ROLES, isValidEmail, type Role } from "@/lib/data";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmails: string[];
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
}

interface Errors {
  email?: string;
  role?: string;
}

export function InviteDialog({
  open,
  onOpenChange,
  existingEmails,
  onInvite,
}: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function validate(): Errors {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = "Enter an email address.";
    } else if (!isValidEmail(trimmed)) {
      next.email = "Enter a valid email address, like name@company.com.";
    } else if (existingEmails.includes(trimmed.toLowerCase())) {
      next.email = "This person is already on the team.";
    }
    if (!role) next.role = "Choose a role for the new member.";
    return next;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      onOpenChange={(e) => handleOpenChange(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="4">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
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
                  placeholder="name@company.com"
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
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select a role</option>
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field>
              <Field
                label="Message"
                optionalText="(optional)"
                helperText="Add a short note to the invitation email."
              >
                <Textarea
                  name="message"
                  rows={3}
                  placeholder="Hi! We're triaging the beta feedback this week and could use your help."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter gap="2">
            <DialogActionTrigger asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button type="submit" colorPalette="orange">
              Send invite
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
