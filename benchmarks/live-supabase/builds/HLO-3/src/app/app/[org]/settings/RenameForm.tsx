"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useActionState } from "react";
import { renameOrganization, type RenameState } from "./actions";

export function RenameForm({ slug, name }: { slug: string; name: string }) {
  const [state, action, pending] = useActionState(renameOrganization.bind(null, slug), {} as RenameState);
  return (
    <form action={action}>
      <Column gap="16">
        <Input id="org-name" name="name" label="Organization name" defaultValue={name} maxLength={80} required />
        {state.error ? (
          <Text variant="body-default-s" onBackground="danger-medium" role="alert">
            {state.error}
          </Text>
        ) : null}
        {state.message ? (
          <Text variant="body-default-s" onBackground="success-medium" role="status">
            {state.message}
          </Text>
        ) : null}
        <Button type="submit" label="Save name" loading={pending} />
      </Column>
    </form>
  );
}
