"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useActionState } from "react";
import { authenticateAction, type AuthState } from "@/lib/actions/auth";

export function AuthForm({ mode, next }: { mode: "signin" | "signup"; next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(authenticateAction, {});
  const signup = mode === "signup";
  return (
    <form action={action}>
      <Column gap="16" fillWidth>
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="next" value={next} />
        <Input id="email" name="email" type="email" label="Email" required autoComplete="email" />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          required
          minLength={8}
          autoComplete={signup ? "new-password" : "current-password"}
          description={signup ? "At least 8 characters." : undefined}
        />
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
        <Button type="submit" label={signup ? "Create account" : "Sign in"} fillWidth loading={pending} />
      </Column>
    </form>
  );
}
