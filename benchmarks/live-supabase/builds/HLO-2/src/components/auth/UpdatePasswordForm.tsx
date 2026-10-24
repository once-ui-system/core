"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useActionState } from "react";
import { updatePasswordAction, type AuthState } from "@/lib/actions/auth";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePasswordAction, {});
  return (
    <form action={action}>
      <Column gap="16" fillWidth>
        <Input
          id="password"
          name="password"
          type="password"
          label="New password"
          required
          minLength={8}
          autoComplete="new-password"
          description="At least 8 characters."
        />
        {state.error && (
          <Text variant="body-default-s" onBackground="danger-strong" role="alert">
            {state.error}
          </Text>
        )}
        <Button type="submit" label="Save password" fillWidth loading={pending} />
      </Column>
    </form>
  );
}
