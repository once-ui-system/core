"use client";

import "./haven.css";

import { Button, Column, Text } from "@once-ui-system/core";
import { type FormEvent, useState } from "react";
import { listings } from "@/lib/data";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email, like name@example.com.";
  if (!values.message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [values, setValues] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function update<K extends keyof Fields>(key: K, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (errors[key]) setErrors({ ...errors, [key]: validate(next)[key] });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Fields)[])[0];
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Column gap="12" role="status" aria-live="polite">
        <Text variant="heading-strong-m">Message sent</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Thanks, {values.name.trim()}. {listings.agent.name} will reply to {values.email.trim()}{" "}
          about “{homeTitle}”, usually within one working day.
        </Text>
        <Button
          variant="secondary"
          size="s"
          onClick={() => {
            setValues({ name: "", email: "", message: "" });
            setSent(false);
          }}
        >
          Send another message
        </Button>
      </Column>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Contact ${listings.agent.name}`}>
      <Column gap="16">
        <div className="haven-field">
          <label htmlFor="c-name">Name</label>
          <input
            id="c-name"
            className="haven-input"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "c-name-err" : undefined}
          />
          {errors.name && (
            <span id="c-name-err" className="haven-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>
        <div className="haven-field">
          <label htmlFor="c-email">Email</label>
          <input
            id="c-email"
            className="haven-input"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "c-email-err" : undefined}
          />
          {errors.email && (
            <span id="c-email-err" className="haven-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>
        <div className="haven-field">
          <label htmlFor="c-message">Message</label>
          <textarea
            id="c-message"
            className="haven-textarea"
            required
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "c-message-err" : undefined}
            placeholder="I would like to arrange a viewing…"
          />
          {errors.message && (
            <span id="c-message-err" className="haven-error" role="alert">
              {errors.message}
            </span>
          )}
        </div>
        <Button type="submit" fillWidth>
          Send message
        </Button>
      </Column>
    </form>
  );
}
