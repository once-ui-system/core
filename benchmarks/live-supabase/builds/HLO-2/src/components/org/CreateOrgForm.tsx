"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useActionState } from "react";
import { createOrganizationAction } from "@/lib/actions/orgs";
import type { OrgState } from "@/lib/actions/orgs";

export function CreateOrgForm() {
  const [state, action, pending] = useActionState<OrgState, FormData>(createOrganizationAction, {});
  return (
    <form action={action}>
      <Column gap="16" fillWidth>
        <Input id="org-name" name="name" label="Organization name" required maxLength={80} />
        {state.error && (
          <Text variant="body-default-s" onBackground="danger-strong" role="alert">
            {state.error}
          </Text>
        )}
        <Button type="submit" label="Create organization" loading={pending} />
      </Column>
    </form>
  );
}
