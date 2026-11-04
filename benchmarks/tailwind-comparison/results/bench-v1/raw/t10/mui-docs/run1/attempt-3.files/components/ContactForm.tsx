"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";

interface Values {
  name: string;
  email: string;
  message: string;
}
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!v.name.trim()) errors.name = "Enter your name.";
  if (!v.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Enter a valid email address.";
  if (!v.message.trim()) errors.message = "Write a message for the agent.";
  return errors;
}

export default function ContactForm({
  homeTitle,
  agentName,
}: {
  homeTitle: string;
  agentName: string;
}) {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello, I'd like to arrange a viewing of "${homeTitle}".`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [sent, setSent] = useState(false);

  const update = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched[key] || errors[key]) setErrors(validate(next));
    setSent(false);
  };

  const blur = (key: keyof Values) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(found).length === 0) {
      setSent(true);
      setValues((v) => ({ ...v, name: "", email: "", message: "" }));
      setTouched({});
    }
  };

  const show = (key: keyof Values) => (touched[key] || errors[key] ? errors[key] : undefined);

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} sx={{ gap: 2 }} aria-label={`Contact ${agentName}`}>
      {sent && (
        <Alert severity="success" role="status">
          Message sent. {agentName} will reply to you shortly.
        </Alert>
      )}
      <TextField
        label="Name"
        name="name"
        autoComplete="name"
        required
        value={values.name}
        onChange={update("name")}
        onBlur={blur("name")}
        error={Boolean(show("name"))}
        helperText={show("name")}
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={update("email")}
        onBlur={blur("email")}
        error={Boolean(show("email"))}
        helperText={show("email")}
        fullWidth
      />
      <TextField
        label="Message"
        name="message"
        required
        multiline
        minRows={4}
        value={values.message}
        onChange={update("message")}
        onBlur={blur("message")}
        error={Boolean(show("message"))}
        helperText={show("message")}
        fullWidth
      />
      <Button type="submit" variant="contained" size="large" endIcon={<SendIcon />}>
        Send message
      </Button>
    </Stack>
  );
}
