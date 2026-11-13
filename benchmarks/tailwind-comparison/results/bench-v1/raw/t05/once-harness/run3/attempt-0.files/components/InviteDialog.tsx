"use client";

import { useId, useState } from "react";
import { Button, Column, Dialog, Input, Row, Select, Textarea } from "@once-ui-system/core";
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTIONS, isValidEmail } from "@/lib/data";

type Errors = { email?: string; role?: string };

export type InvitePayload = { email: string; role: string; message: string };

export function InviteDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: InvitePayload) => void;
}) {
  const uid = useId();
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

  const validate = (nextEmail: string, nextRole: string): Errors => {
    const next: Errors = {};
    if (!nextEmail.trim()) next.email = "Enter an email address.";
    else if (!isValidEmail(nextEmail)) next.email = "Enter a valid email, like name@company.com.";
    if (!nextRole) next.role = "Choose a role for this person.";
    return next;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate(email, role);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInvite({ email: email.trim(), role, message: message.trim() });
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite a member"
      description="They'll get an email with a link to join your Lumen workspace."
    >
      <Column as="form" gap="16" fillWidth onSubmit={handleSubmit} noValidate>
        <Input
          id={`${uid}-email`}
          label="Email address"
          type="email"
          autoComplete="off"
          value={email}
          onValueChange={(value) => {
            setEmail(value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={Boolean(errors.email)}
          errorMessage={errors.email}
          aria-required="true"
        />
        <Select
          id={`${uid}-role`}
          label="Role"
          value={role}
          onValueChange={(value) => {
            setRole(Array.isArray(value) ? (value[0] ?? "") : value);
            if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
          }}
          options={ASSIGNABLE_ROLES.map((item) => ({
            value: item,
            label: item,
            description: ROLE_DESCRIPTIONS[item],
          }))}
          error={Boolean(errors.role)}
          errorMessage={errors.role}
          aria-required="true"
        />
        <Textarea
          id={`${uid}-message`}
          label="Message (optional)"
          lines={3}
          value={message}
          onValueChange={setMessage}
          description="Add a short note, like which project they'll work on."
        />
        <Row gap="8" horizontal="end" fillWidth s={{ direction: "column-reverse" }}>
          <Button type="button" variant="tertiary" onClick={close}>
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
