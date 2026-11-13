"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Heading,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { AGENT } from "@/lib/data";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email.trim()))
    errors.email = "Enter a valid email address, like name@example.com.";
  if (!message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `Hello, I'd like to arrange a viewing of "${homeTitle}".`,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate(name, email, message);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSent(false);
      const first = (["name", "email", "message"] as const).find(
        (k) => next[k],
      );
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setSent(true);
  };

  return (
    <Box
      as="form"
      noValidate
      onSubmit={onSubmit}
      aria-labelledby="contact-heading"
      borderWidth="1px"
      borderRadius="lg"
      p="5"
      bg="bg"
      boxShadow="sm"
    >
      <Heading as="h2" id="contact-heading" size="md">
        Contact {AGENT.name}
      </Heading>
      <Text color="fg.muted" fontSize="sm" mt="1" mb="4">
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sent && (
        <Alert.Root status="success" mb="4">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Message sent</Alert.Title>
            <Alert.Description>
              Thanks, {name.trim()}. {AGENT.name} will reply to {email.trim()}{" "}
              shortly.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Box display="flex" flexDirection="column" gap="4">
        <Field
          label="Name"
          required
          invalid={!!errors.name}
          errorText={errors.name}
        >
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field
          label="Email"
          required
          invalid={!!errors.email}
          errorText={errors.email}
        >
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field
          label="Message"
          required
          invalid={!!errors.message}
          errorText={errors.message}
        >
          <Textarea
            id="contact-message"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>
        <Button type="submit" colorPalette="teal">
          Send message
        </Button>
      </Box>
    </Box>
  );
}
