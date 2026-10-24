"use client";

import { Button, Column, Input, Select, Text } from "@once-ui-system/core";
import { useActionState, useState } from "react";
import { createInvitationAction } from "@/lib/actions/orgs";
import type { OrgState } from "@/lib/actions/orgs";

export function InviteForm({ org }: { org: string }) {
  const [state, action, pending] = useActionState<OrgState, FormData>(createInvitationAction, {});
  const [role, setRole] = useState("member");
  return (
    <form action={action}>
      <Column gap="16" fillWidth>
        <input type="hidden" name="org" value={org} />
        <input type="hidden" name="role" value={role} />
        <Input id="invite-email" name="email" type="email" label="Email (optional)" />
        <Select
          id="invite-role"
          label="Role"
          value={role}
          onSelect={(value) => setRole(Array.isArray(value) ? (value[0] ?? "member") : value)}
          options={[
            { value: "member", label: "Member" },
            { value: "admin", label: "Admin" },
          ]}
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
        {state.url && <Input id="invite-url" label="Invitation link" value={state.url} readOnly />}
        <Button type="submit" label="Create invitation link" variant="secondary" loading={pending} />
      </Column>
    </form>
  );
}
