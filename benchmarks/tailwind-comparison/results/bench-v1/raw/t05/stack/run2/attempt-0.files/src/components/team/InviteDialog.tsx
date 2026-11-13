"use client";

import { Button, Column, Dialog, Row, Select, Textarea, Input } from "@once-ui-system/core";
import { useEffect, useState } from "react";
import { type Role, isValidEmail, roles } from "@/lib/data";

type Errors = {
  email?: string;
  role?: string;
};

export function InviteDialog({
  open,
  onClose,
  onInvite,
  existingEmails,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: Role) => void;
  existingEmails: string[];
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("");
      setMessage("");
      setErrors({});
    }
  }, [open]);

  const validate = (): Errors => {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = "Enter an email address.";
    } else if (!isValidEmail(trimmed)) {
      next.email = "Enter a valid email address, like name@company.com.";
    } else if (existingEmails.includes(trimmed.toLowerCase())) {
      next.email = "This person is already on the team.";
    }
    if (!role) {
      next.role = "Choose a role for this person.";
    }
    return next;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInvite(email.trim(), role as Role);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite a member"
      description="They’ll get an email with a link to join the Acme Labs workspace."
    >
      <form onSubmit={handleSubmit} noValidate aria-label="Invite a member">
        <Column gap="16" paddingTop="8">
          <Input
            id="invite-email"
            type="email"
            label="Email"
            placeholder="name@company.com"
            value={email}
            required
            autoComplete="off"
            error={!!errors.email}
            errorMessage={errors.email}
            aria-invalid={!!errors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
            }}
          />
          <Select
            id="invite-role"
            label="Role"
            options={roles.map((r) => ({ value: r, label: r }))}
            value={role}
            error={!!errors.role}
            errorMessage={errors.role}
            onSelect={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              setRole(next ?? "");
              if (errors.role) setErrors((current) => ({ ...current, role: undefined }));
            }}
          />
          <Textarea
            id="invite-message"
            label="Message (optional)"
            lines={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" prefixIcon="send">
              Send invite
            </Button>
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
