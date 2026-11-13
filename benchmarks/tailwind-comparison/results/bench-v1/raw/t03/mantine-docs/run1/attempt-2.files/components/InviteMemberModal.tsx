"use client";

import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { isEmail, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

interface InviteMemberModalProps {
  opened: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ opened, onClose }: InviteMemberModalProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "" },
    validate: {
      email: isEmail("Enter a valid email address"),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: { email: string }) => {
    notifications.show({
      title: "Invitation sent",
      message: `${values.email} will receive an invite to join Acme Labs on Lumen.`,
      color: "teal",
      icon: <IconCheck size={18} aria-hidden />,
    });
    handleClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Invite member" centered>
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Text size="sm" c="dimmed" mb="md">
          Invite a teammate by email. They will join as a Member and can be given a different role later.
        </Text>
        <TextInput
          label="Email"
          placeholder="teammate@acmelabs.io"
          type="email"
          autoComplete="email"
          withAsterisk
          data-autofocus
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Send invite</Button>
        </Group>
      </form>
    </Modal>
  );
}
