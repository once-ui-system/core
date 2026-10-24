"use client";

import { Button, Column, Input, Row, Text } from "@once-ui-system/core";
import { useActionState, useState } from "react";
import { requestPasswordReset, signIn, signUp, updatePassword, type FormState } from "@/app/(site)/auth/actions";

const initial: FormState = {};

function Feedback({ state }: { state: FormState }) {
  if (!state.error && !state.message) return null;
  return (
    <Text variant="body-default-s" onBackground={state.error ? "danger-medium" : "success-medium"} role="status">
      {state.error ?? state.message}
    </Text>
  );
}

/** Sign in and sign up share one form; the tabs switch which action it posts to. */
export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [signInState, signInAction, signingIn] = useActionState(signIn, initial);
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, initial);
  const state = mode === "sign-in" ? signInState : signUpState;
  const pending = mode === "sign-in" ? signingIn : signingUp;

  return (
    <Column gap="24" background="surface" border radius="l" padding="24" fillWidth>
      <Column gap="8">
        <Text variant="label-strong-s" onBackground="neutral-weak">
          {mode === "sign-in" ? "Sign in" : "Create an account"}
        </Text>
        <Row gap="8">
          <Button
            size="s"
            variant={mode === "sign-in" ? "primary" : "secondary"}
            label="Sign in"
            onClick={() => setMode("sign-in")}
            type="button"
          />
          <Button
            size="s"
            variant={mode === "sign-up" ? "primary" : "secondary"}
            label="Sign up"
            onClick={() => setMode("sign-up")}
            type="button"
          />
        </Row>
      </Column>

      {notice ? (
        <Text variant="body-default-s" onBackground="neutral-weak">
          {notice}
        </Text>
      ) : null}

      <form action={mode === "sign-in" ? signInAction : signUpAction}>
        <Column gap="16">
          <input type="hidden" name="next" value={next} />
          <Input id="email" name="email" type="email" label="Email" autoComplete="email" required />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
            minLength={mode === "sign-up" ? 8 : undefined}
          />
          <Feedback state={state} />
          <Button type="submit" label={mode === "sign-in" ? "Sign in" : "Create account"} loading={pending} fillWidth />
        </Column>
      </form>

      {mode === "sign-in" ? (
        <Button href="/auth/forgot-password" variant="link" label="Forgot your password?" size="s" />
      ) : null}
    </Column>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <Column gap="24" background="surface" border radius="l" padding="24" fillWidth>
      <form action={action}>
        <Column gap="16">
          <Input id="email" name="email" type="email" label="Email" autoComplete="email" required />
          <Feedback state={state} />
          <Button type="submit" label="Send reset link" loading={pending} fillWidth />
        </Column>
      </form>
    </Column>
  );
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  return (
    <Column gap="24" background="surface" border radius="l" padding="24" fillWidth>
      <form action={action}>
        <Column gap="16">
          <Input
            id="password"
            name="password"
            type="password"
            label="New password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Feedback state={state} />
          <Button type="submit" label="Set new password" loading={pending} fillWidth />
        </Column>
      </form>
    </Column>
  );
}
