"use client";

import {
  Column,
  Field,
  Fieldset,
  Form,
  FormErrorSummary,
  Heading,
  Input,
  PasswordInput,
  SubmitButton,
  Text,
  Textarea,
} from "@once-ui-system/core";
import { useState } from "react";

type Errors = Record<string, string | undefined>;

/** The 2.3 form building blocks end to end: a failed submit, then a saving one. */
export default function FormBlocksPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Errors = {};
    if (!String(data.get("email") ?? "").includes("@"))
      next.email = "Enter an email address, like you@example.com";
    if (String(data.get("password") ?? "").length < 8) next.password = "Use at least 8 characters";
    if (!String(data.get("workspace") ?? "")) next.workspace = "Name your workspace";
    setErrors(next);
    setSaved(false);
    if (Object.values(next).some(Boolean)) return;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSaved(true);
  };

  return (
    <Column maxWidth="s" fillWidth gap="24" paddingY="64" paddingX="16" horizontal="center">
      <Heading variant="heading-strong-l">Create your workspace</Heading>
      <Form as="form" density="spacious" noValidate onSubmit={submit}>
        <FormErrorSummary errors={errors} />
        <Fieldset legend="Account" description="You sign in with these.">
          <Field label="Email" required error={errors.email}>
            <Input id="email" name="email" placeholder="you@example.com" />
          </Field>
          <Field label="Password" required error={errors.password} hint="At least 8 characters.">
            <PasswordInput id="password" name="password" />
          </Field>
        </Fieldset>
        <Fieldset legend="Workspace" columns={{ xs: 1, m: 2 }}>
          <Field label="Name" required error={errors.workspace}>
            <Input id="workspace" name="workspace" />
          </Field>
          <Field label="URL" hint="once-ui.com/your-name">
            <Input id="slug" name="slug" />
          </Field>
          <Field label="About" span={2}>
            <Textarea id="about" name="about" lines={3} />
          </Field>
        </Fieldset>
        <SubmitButton pendingLabel="Creating…">Create workspace</SubmitButton>
        {saved && (
          <Text variant="body-default-m" onBackground="success-medium">
            Workspace created.
          </Text>
        )}
      </Form>
    </Column>
  );
}
