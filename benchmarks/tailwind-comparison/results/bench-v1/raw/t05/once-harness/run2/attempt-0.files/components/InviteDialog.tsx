"use client";

import { useState } from "react";
import { Button, Column, Dialog, Input, Row, Select, Textarea } from "@once-ui-system/core";
import { ROLES, type Role } from "@/lib/data";

type Errors = { email?: string; role?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
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

  const handleClose = () => {
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
      onClose={handleClose}
      title="Invite a team member"
      description="They’ll get an email with a link to join your Lumen workspace."
    >
      <Column as="form" gap="16" fillWidth onSubmit={handleSubmit} noValidate>
        <Input
          id="invite-email"
          label="Email address"
          type="email"
          value={email}
          onValueChange={(value) => {
            setEmail(value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={Boolean(errors.email)}
          errorMessage={errors.email}
          autoComplete="off"
          required
        />
        <Select
          id="invite-role"
          label="Role"
          value={role}
          onValueChange={(value) => {
            setRole(Array.isArray(value) ? (value[0] ?? "") : value);
            if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
          }}
          error={Boolean(errors.role)}
          errorMessage={errors.role}
          options={ROLES.map((item) => ({ value: item, label: item }))}
        />
        <Textarea
          id="invite-message"
          label="Message (optional)"
          lines={3}
          value={message}
          onValueChange={setMessage}
          description="Add a short note to include in the invite email."
        />
        <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }} fillWidth>
          <Button type="button" variant="secondary" onClick={handleClose}>
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
