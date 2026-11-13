"use client";

import { useId, useState } from "react";
import { Column, Heading, Text } from "@once-ui-system/core";
import { AGENT } from "@/lib/data";
import styles from "./haven.module.css";

interface Values {
  name: string;
  email: string;
  message: string;
}
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your name.";
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "Enter a valid email address, like name@example.com.";
  if (!v.message.trim()) e.message = "Write a message for the agent.";
  return e;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const uid = useId();
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello ${AGENT.name.split(" ")[0]}, I'd like to know more about "${homeTitle}" and arrange a viewing.`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    message: `${uid}-message`,
  };

  const update = (key: keyof Values, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    // Re-validate a field that already shows an error as the user fixes it.
    if (errors[key]) {
      const fresh = validate(next);
      setErrors((prev) => ({ ...prev, [key]: fresh[key] }));
    }
  };

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Values)[])[0];
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className={styles.success} role="status">
        <Heading as="h3" textVariant="heading-strong-m">
          Message sent
        </Heading>
        <Text as="p" onBackground="neutral-medium" marginTop="8">
          Thanks, {values.name.trim()}. {AGENT.name} will reply to {values.email.trim()} within one
          working day.
        </Text>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Contact ${AGENT.name}`}>
      <Column gap="16">
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.name}>
            Name
          </label>
          <input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="name"
            required
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${ids.name}-err` : undefined}
          />
          {errors.name ? (
            <p id={`${ids.name}-err`} className={styles.errorText}>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.email}>
            Email
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${ids.email}-err` : undefined}
          />
          {errors.email ? (
            <p id={`${ids.email}-err`} className={styles.errorText}>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor={ids.message}>
            Message
          </label>
          <textarea
            id={ids.message}
            name="message"
            required
            className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `${ids.message}-err` : undefined}
          />
          {errors.message ? (
            <p id={`${ids.message}-err`} className={styles.errorText}>
              {errors.message}
            </p>
          ) : null}
        </div>

        <button type="submit" className={styles.submitBtn}>
          Send message
        </button>
      </Column>
    </form>
  );
}
