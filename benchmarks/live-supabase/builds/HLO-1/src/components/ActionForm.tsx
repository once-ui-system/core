"use client";

import { Button, Column, Text } from "@once-ui-system/core";
import { useActionState } from "react";
import type { FormState } from "@/lib/actions/auth";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/** A native form posting to a server action, with its error and success message. */
export function ActionForm({
  action,
  submitLabel,
  children,
}: {
  action: Action;
  submitLabel: string;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction}>
      <Column gap="16" fillWidth>
        {children}
        {state.error && (
          <Text as="p" variant="body-default-s" onBackground="danger-strong" role="alert">
            {state.error}
          </Text>
        )}
        {state.message && (
          <Text as="p" variant="body-default-s" onBackground="success-strong" role="status">
            {state.message}
          </Text>
        )}
        <Button type="submit" label={submitLabel} loading={pending} fillWidth size="l" />
      </Column>
    </form>
  );
}
