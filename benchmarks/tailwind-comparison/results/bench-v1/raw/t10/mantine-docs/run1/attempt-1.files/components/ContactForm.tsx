"use client";

import { useState } from "react";
import { Alert, Button, Paper, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconSend } from "@tabler/icons-react";
import { AGENT, type Home } from "@/lib/data";

interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export function ContactForm({ home }: { home: Home }) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ContactValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      email: "",
      message: `Hello ${AGENT.name.split(" ")[0]}, I would like to arrange a viewing of "${home.title}" in ${home.district}.`,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Please enter your name" : null),
      email: (v) =>
        v.trim().length === 0
          ? "Please enter your email address"
          : /^\S+@\S+\.\S+$/.test(v.trim())
            ? null
            : "Enter a valid email address, like name@example.com",
      message: (v) => (v.trim().length < 10 ? "Please write a message of at least 10 characters" : null),
    },
  });

  return (
    <Paper withBorder radius="md" p="lg" component="section" aria-labelledby="contact-heading">
      <Title order={2} fz="lg" id="contact-heading">
        Contact {AGENT.name}
      </Title>
      <Text size="sm" c="dimmed" mt={2} mb="md">
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sentTo ? (
        <Alert color="teal" icon={<IconCheck size={18} />} title="Message sent" role="status">
          Thanks, {sentTo}. {AGENT.name} will reply to you within one working day.
          <div>
            <Button mt="sm" size="xs" variant="light" color="teal" onClick={() => setSentTo(null)}>
              Send another message
            </Button>
          </div>
        </Alert>
      ) : (
        <form
          noValidate
          onSubmit={form.onSubmit((values) => {
            setSentTo(values.name.trim());
            form.reset();
          })}
        >
          <Stack gap="sm">
            <TextInput
              label="Name"
              placeholder="Your full name"
              autoComplete="name"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              {...form.getInputProps("email")}
            />
            <Textarea label="Message" autosize minRows={4} required {...form.getInputProps("message")} />
            <Button type="submit" color="teal" leftSection={<IconSend size={16} aria-hidden="true" />}>
              Send message
            </Button>
          </Stack>
        </form>
      )}
    </Paper>
  );
}
