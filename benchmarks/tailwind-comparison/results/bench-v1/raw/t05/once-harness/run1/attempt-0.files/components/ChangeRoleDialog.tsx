"use client";

import { Button, Column, Dialog, Row, Select } from "@once-ui-system/core";
import { useState } from "react";
import { ROLES, ROLE_DESCRIPTIONS, type Member, type Role } from "@/lib/data";

export function ChangeRoleDialog({
  member,
  onClose,
  onSave,
}: {
  member: Member | null;
  onClose: () => void;
  onSave: (id: string, role: Role) => void;
}) {
  return (
    <Dialog
      open={member !== null}
      onClose={onClose}
      title="Change role"
      description={member ? `Choose a new role for ${member.name}.` : undefined}
    >
      {member && <RoleForm key={member.id} member={member} onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

function RoleForm({
  member,
  onClose,
  onSave,
}: {
  member: Member;
  onClose: () => void;
  onSave: (id: string, role: Role) => void;
}) {
  const [role, setRole] = useState<string>(member.role);

  return (
    <Column
      as="form"
      gap="16"
      aria-label={`Change role for ${member.name}`}
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(member.id, role as Role);
      }}
    >
      <Select
        id="change-role"
        label="Role"
        value={role}
        options={ROLES.map((r) => ({ value: r, label: r, description: ROLE_DESCRIPTIONS[r] }))}
        onValueChange={(value) => setRole(Array.isArray(value) ? (value[0] ?? member.role) : value)}
      />
      <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save role</Button>
      </Row>
    </Column>
  );
}
