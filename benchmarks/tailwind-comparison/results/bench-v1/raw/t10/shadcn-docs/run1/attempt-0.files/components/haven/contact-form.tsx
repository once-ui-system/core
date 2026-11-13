"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { AGENT, type Home } from "@/lib/data";

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
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Enter a valid email address, like name@example.com.";
  if (!v.message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ home }: { home: Home }) {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello, I'd like to arrange a viewing of "${home.title}" in ${home.district}.`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function update<K extends keyof Values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    const firstInvalid = (["name", "email", "message"] as const).find((k) => next[k]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }
    setSent(true);
    toast.success(`Message sent to ${AGENT.name}`, {
      description: "She usually replies within one working day.",
    });
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-lg bg-muted p-4 text-sm">
        <p className="font-medium">Thanks, {values.name.trim()}. Your message is on its way.</p>
        <p className="text-muted-foreground">
          {AGENT.name} will reply to {values.email.trim()} about {home.title}.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => {
            setSent(false);
            setValues((prev) => ({ ...prev, message: "" }));
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Contact ${AGENT.name} about ${home.title}`}>
      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="contact-name">Name</FieldLabel>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          <FieldError id="contact-name-error">{errors.name}</FieldError>
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="contact-email">Email</FieldLabel>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          <FieldError id="contact-email-error">{errors.email}</FieldError>
        </Field>
        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="contact-message">Message</FieldLabel>
          <Textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
          <FieldError id="contact-message-error">{errors.message}</FieldError>
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Send message
        </Button>
      </FieldGroup>
      <ul className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Phone className="size-4" aria-hidden="true" />
          <a href={`tel:${AGENT.phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:underline">
            {AGENT.phone}
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Mail className="size-4" aria-hidden="true" />
          <a href={`mailto:${AGENT.email}`} className="underline-offset-4 hover:underline">
            {AGENT.email}
          </a>
        </li>
      </ul>
    </form>
  );
}
