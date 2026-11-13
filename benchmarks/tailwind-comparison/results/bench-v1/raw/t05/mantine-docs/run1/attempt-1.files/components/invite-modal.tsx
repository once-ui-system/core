"use client";

import { Button, Group, Modal, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/data";

export interface InviteValues {
  email: string;
  role: string;
  message: string;
}

interface InviteModalProps {
  opened: boolean;
  onClose: () => void;
  onInvite: (values: { email: string; role: Role; message: string }) => void;
  existingEmails: string[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteModal({ opened, onClose, onInvite, existingEmails }: InviteModalProps) {
  const form = useForm<InviteValues>({
    mode: "uncontrolled",
    initialValues: { email: "", role: "", message: "" },
    validate: {
      email: (value) => {
        const email = value.trim();
        if (!email) return "Email is required";
        if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address, like name@company.com";
        if (existingEmails.includes(email.toLowerCase())) {
          return "This person is already on the team";
        }
        return null;
      },
      role: (value) => (value ? null : "Choose a role for the new member"),
      message: (value) => (value.length > 300 ? "Keep the message under 300 characters" : null),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(
    (values) => {
      onInvite({
        email: values.email.trim(),
        role: values.role as Role,
        message: values.message.trim(),
      });
      form.reset();
    },
    (errors) => {
      const firstPath = Object.keys(errors)[0];
      if (firstPath) form.getInputNode(firstPath)?.focus();
    },
  );

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Invite a team member"
      centered
      size="md"
      closeButtonProps={{ "aria-label": "Close invite dialog" }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <TextInput
            label="Email address"
            placeholder="name@company.com"
            type="email"
            autoComplete="off"
            withAsterisk
            data-autofocus
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <Select
            label="Role"
            placeholder="Select a role"
            withAsterisk
            allowDeselect={false}
            data={ASSIGNABLE_ROLES.map((role) => ({
              value: role,
              label: `${role} – ${ROLE_DESCRIPTIONS[role]}`,
            }))}
            comboboxProps={{ withinPortal: true }}
            key={form.key("role")}
            {...form.getInputProps("role")}
          />
          <Textarea
            label="Personal message"
            description="Optional. Included in the invitation email."
            placeholder="Hi! We're using Lumen to track activation and bugs together."
            autosize
            minRows={3}
            maxRows={6}
            key={form.key("message")}
            {...form.getInputProps("message")}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
