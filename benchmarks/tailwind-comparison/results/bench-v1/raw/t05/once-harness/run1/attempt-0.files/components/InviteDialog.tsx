"use client";

import { Button, Column, Dialog, Input, Row, Select, Textarea } from "@once-ui-system/core";
import { useState } from "react";
import { ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/data";

export type InvitePayload = { email: string; role: Role; message: string };

type Errors = { email?: string; role?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: InvitePayload) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
      description="They'll get an email with a link to join your Lumen workspace."
    >
      <Column as="form" gap="16" onSubmit={handleSubmit} noValidate aria-label="Invite a member">
        <Input
          id="invite-email"
          label="Email address"
          type="email"
          value={email}
          required
          autoComplete="off"
          error={Boolean(errors.email)}
          errorMessage={errors.email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
        <Column gap="8" fillWidth>
          <Select
            id="invite-role"
            label="Role"
            value={role}
            error={Boolean(errors.role)}
            errorMessage={errors.role}
            options={ROLES.map((r) => ({
              value: r,
              label: r,
              description: ROLE_DESCRIPTIONS[r],
            }))}
            onValueChange={(value) => {
              setRole(Array.isArray(value) ? (value[0] ?? "") : value);
              if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
            }}
          />
        </Column>
        <Textarea
          id="invite-message"
          label="Message (optional)"
          lines={3}
          value={message}
          description="Add a note to the invitation email."
          onChange={(event) => setMessage(event.target.value)}
        />
        <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" prefixIcon="send">
            Send invite
          </Button>
        </Row>
      </Column>
    </Dialog>
  );
}
