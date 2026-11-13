"use client";

import { Button, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

interface CreateProjectModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ opened, onClose }: CreateProjectModalProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", key: "" },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Name must have at least 2 characters" : null),
      key: (value) => (/^[A-Za-z]{2,5}$/.test(value.trim()) ? null : "Use 2–5 letters, for example DOCS"),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: { name: string; key: string }) => {
    notifications.show({
      title: "Project created",
      message: `${values.name} (${values.key.trim().toUpperCase()}) is ready for its first issue.`,
      color: "teal",
      icon: <IconCheck size={18} aria-hidden />,
    });
    handleClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Create project" centered>
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <TextInput
          label="Project name"
          placeholder="Docs portal"
          withAsterisk
          data-autofocus
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput
          mt="md"
          label="Project key"
          description="Short prefix used for issue IDs"
          placeholder="DOCS"
          withAsterisk
          key={form.key("key")}
          {...form.getInputProps("key")}
        />
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Create project</Button>
        </Group>
      </form>
    </Modal>
  );
}
