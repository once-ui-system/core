"use client";

import { Button, Column, Dialog, Input, Row, Select, Text, Textarea } from "@once-ui-system/core";
import { type FormEvent, useState } from "react";
import { EMAIL_PATTERN, type Role, inviteRoles, roleDescriptions } from "@/lib/data";

type InviteDialogProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
};

type Errors = { email?: string; role?: string };

export function InviteDialog({ open, onClose, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const reset = () => {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  };

  const close = () => {
    reset();
    onClose();
  };

  const validate = (): Errors => {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Enter an email address.";
    else if (!EMAIL_PATTERN.test(trimmed)) next.email = "Enter a valid email, like name@company.com.";
    if (!role) next.role = "Choose a role for this person.";
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInvite({ email: email.trim(), role: role as Role, message: message.trim() });
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite a member"
      description="They'll get an email with a link to join the Acme Labs workspace."
    >
      <form onSubmit={handleSubmit} noValidate aria-label="Invite a member">
        <Column gap="16" paddingTop="8">
          <Input
            id="invite-email"
            type="email"
            label="Email address"
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={Boolean(errors.email)}
            errorMessage={errors.email}
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
          />
          <Column gap="8">
            <Select
              id="invite-role"
              label="Role"
              options={inviteRoles.map((r) => ({
                value: r,
                label: r,
                description: roleDescriptions[r],
              }))}
              value={role}
              onSelect={(value) => {
                setRole(Array.isArray(value) ? (value[0] ?? "") : value);
                if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
              }}
              error={Boolean(errors.role)}
              errorMessage={errors.role}
              aria-required="true"
            />
          </Column>
          <Textarea
            id="invite-message"
            label="Message (optional)"
            lines={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            description="Add a short note so they know what to expect."
          />
          <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
            <Button type="button" variant="tertiary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" prefixIcon="mail">
              Send invite
            </Button>
          </Row>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Fields marked with a role and an email are required.
          </Text>
        </Column>
      </form>
    </Dialog>
  );
}
