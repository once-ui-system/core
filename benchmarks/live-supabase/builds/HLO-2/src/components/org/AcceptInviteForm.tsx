"use client";

import { Button, Column, Text } from "@once-ui-system/core";
import { useActionState } from "react";
import { acceptInvitationAction } from "@/lib/actions/orgs";
import type { OrgState } from "@/lib/actions/orgs";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<OrgState, FormData>(acceptInvitationAction, {});
  return (
    <form action={action}>
      <Column gap="16" fillWidth>
        <input type="hidden" name="token" value={token} />
        {state.error && (
          <Text variant="body-default-s" onBackground="danger-strong" role="alert">
            {state.error}
          </Text>
        )}
        <Button type="submit" label="Join organization" fillWidth loading={pending} />
      </Column>
    </form>
  );
}
