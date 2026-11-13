"use client";

import { useState } from "react";
import { Alert, Box, Button, Heading, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { Field } from "./ui/field";
import { AGENT } from "../lib/data";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = "Enter a valid email address, like name@example.com.";
  if (!message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate(name, email, message);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSent(false);
      const first = (["name", "email", "message"] as const).find((k) => next[k]);
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Box as="section" aria-labelledby="contact-heading" borderWidth="1px" rounded="lg" p={5} bg="bg">
      <Heading as="h2" id="contact-heading" size="md">
        Contact {AGENT.name}
      </Heading>
      <Text color="fg.muted" fontSize="sm" mt={1} mb={4}>
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sent && (
        <Alert.Root status="success" mb={4} role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Message sent</Alert.Title>
            <Alert.Description>
              {AGENT.name} will reply about “{homeTitle}” within one working day.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Stack gap={4}>
          <Field label="Name" required invalid={!!errors.name} errorText={errors.name}>
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Santos"
            />
          </Field>
          <Field label="Email" required invalid={!!errors.email} errorText={errors.email}>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@example.com"
            />
          </Field>
          <Field label="Message" required invalid={!!errors.message} errorText={errors.message}>
            <Textarea
              id="contact-message"
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'd like to arrange a viewing this week."
            />
          </Field>
          <Button type="submit" colorPalette="teal">
            Send message
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
