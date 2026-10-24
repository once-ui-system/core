"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useActionState } from "react";
import { renameOrganizationAction } from "@/lib/actions/orgs";
import type { OrgState } from "@/lib/actions/orgs";

export function RenameOrgForm({ org, name, canEdit }: { org: string; name: string; canEdit: boolean }) {
  const [state, action, pending] = useActionState<OrgState, FormData>(renameOrganizationAction, {});
  if (!canEdit) {
    return <Text onBackground="neutral-medium">Only owners and admins can rename this organization.</Text>;
  }
  return (
    <form action={action}>
      <Column gap="16" fillWidth>
        <input type="hidden" name="org" value={org} />
        <Input id="org-rename" name="name" label="Organization name" defaultValue={name} required maxLength={80} />
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
        <Button type="submit" label="Save name" variant="secondary" loading={pending} />
      </Column>
    </form>
  );
}
