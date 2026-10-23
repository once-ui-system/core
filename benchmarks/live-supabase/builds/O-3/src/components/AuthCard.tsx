"use client";

import { Button, Column, Heading, Input, Row, Text } from "@once-ui-system/core";
import { useActionState, useState } from "react";
import {
  forgotPassword,
  signIn,
  signUp,
  updatePassword,
  type FormState,
} from "@/app/auth/actions";

type Kind = "auth" | "forgot" | "update";

export function AuthCard({ kind, next, linkError }: { kind: Kind; next?: string; linkError?: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action =
    kind === "forgot" ? forgotPassword : kind === "update" ? updatePassword : mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);

  const title =
    kind === "forgot"
      ? "Reset your password"
      : kind === "update"
        ? "Set a new password"
        : mode === "signin"
          ? "Sign in"
          : "Create your account";

  return (
    <Column maxWidth={28} fillWidth background="surface" border radius="l" padding="32" gap="24">
      <Column gap="8">
        <Heading variant="heading-strong-xl" as="h1">
          {title}
        </Heading>
        {kind === "auth" && (
          <Text onBackground="neutral-weak">
            {mode === "signin" ? "Welcome back to Acme Notes." : "Start with the free plan."}
          </Text>
        )}
      </Column>
      {linkError && (
        <Text onBackground="danger-medium">That link is invalid or has expired. Try again.</Text>
      )}
      <form action={formAction} key={`${kind}-${mode}`}>
        <Column gap="16">
          {next && <input type="hidden" name="next" value={next} />}
          {kind !== "update" && (
            <Input id="email" name="email" type="email" label="Email" required autoComplete="email" />
          )}
          {kind !== "forgot" && (
            <Input
              id="password"
              name="password"
              type="password"
              label={kind === "update" ? "New password" : "Password"}
              required
              autoComplete={mode === "signin" && kind === "auth" ? "current-password" : "new-password"}
            />
          )}
          {kind === "update" && (
            <Input
              id="confirm"
              name="confirm"
              type="password"
              label="Confirm password"
              required
              autoComplete="new-password"
            />
          )}
          {state?.error && (
            <Text role="alert" variant="body-default-s" onBackground="danger-medium">
              {state.error}
            </Text>
          )}
          {state?.message && (
            <Text role="status" variant="body-default-s" onBackground="brand-medium">
              {state.message}
            </Text>
          )}
          <Button type="submit" fillWidth loading={pending}>
            {kind === "forgot"
              ? "Send reset link"
              : kind === "update"
                ? "Update password"
                : mode === "signin"
                  ? "Sign in"
                  : "Sign up"}
          </Button>
        </Column>
      </form>
      {kind === "auth" && (
        <Row horizontal="between" vertical="center" gap="8">
          <Button
            variant="tertiary"
            size="s"
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            label={mode === "signin" ? "Create an account" : "I have an account"}
          />
          <Button variant="tertiary" size="s" href="/auth/forgot" label="Forgot password?" />
        </Row>
      )}
      {kind === "forgot" && <Button variant="tertiary" size="s" href="/auth" label="Back to sign in" />}
    </Column>
  );
}
