"use client";

import { Button, Column, Input, Select, Text } from "@once-ui-system/core";
import { useActionState, useState } from "react";
import { createInvitationAction } from "@/lib/actions/orgs";

const roles = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

/** Creates an invitation link. The role is kept in state and posted as a hidden field. */
export function InviteForm({ slug }: { slug: string }) {
  const [role, setRole] = useState("member");
  const [state, formAction, pending] = useActionState(createInvitationAction, {});
  return (
    <form action={formAction}>
      <Column gap="16" fillWidth>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="role" value={role} />
        <Input id="invite-email" name="email" type="email" label="Email (optional)" description="Leave empty for a link anyone with the link can use." />
        <Select
          id="invite-role"
          label="Role"
          options={roles}
          value={role}
          onSelect={(value) => setRole(Array.isArray(value) ? value[0] : value)}
        />
        {state.error && (
          <Text as="p" variant="body-default-s" onBackground="danger-strong" role="alert">
            {state.error}
          </Text>
        )}
        {state.message && (
          <Column gap="8">
            <Text as="p" variant="body-default-s" onBackground="success-strong" role="status">
              {state.message}
            </Text>
            {state.url && (
              <Text as="p" variant="code-default-s" onBackground="neutral-medium" style={{ wordBreak: "break-all" }}>
                {state.url}
              </Text>
            )}
          </Column>
        )}
        <Button type="submit" label="Create invitation link" loading={pending} size="l" fillWidth />
      </Column>
    </form>
  );
}
