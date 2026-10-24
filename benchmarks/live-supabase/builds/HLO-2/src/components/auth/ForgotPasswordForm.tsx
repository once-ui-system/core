"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useActionState } from "react";
import { requestPasswordResetAction, type AuthState } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordResetAction, {});
  return (
    <form action={action}>
      <Column gap="16" fillWidth>
        <Input id="email" name="email" type="email" label="Email" required autoComplete="email" />
        {state.error && (
          <Text variant="body-default-s" onBackground="danger-strong" role="alert">
            {state.error}
          </Text>
        )}
        {state.message && (
          <Text variant="body-default-s" onBackground="success-strong" role="status">
            {state.message}
          </Text>
        )}
        <Button type="submit" label="Send reset link" fillWidth loading={pending} />
      </Column>
    </form>
  );
}
