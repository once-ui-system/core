"use client";

import { Button, Column, Dialog, Row, SegmentedControl, Text } from "@once-ui-system/core";
import { useState } from "react";
import { type Member, type Role, inviteRoles, roleDescriptions } from "@/lib/data";

type ChangeRoleDialogProps = {
  member: Member | null;
  onClose: () => void;
  onSave: (member: Member, role: Role) => void;
};

export function ChangeRoleDialog({ member, onClose, onSave }: ChangeRoleDialogProps) {
  return (
    <Dialog
      open={member !== null}
      onClose={onClose}
      title={member ? `Change role for ${member.name}` : "Change role"}
      description="Roles decide what someone can see and change in the workspace."
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
  onSave: (member: Member, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(member.role);
  const options: Role[] = member.role === "Owner" ? ["Owner", ...inviteRoles] : inviteRoles;

  return (
    <Column gap="16" paddingTop="8">
      <SegmentedControl
        fillWidth
        value={role}
        onChange={(value) => setRole(value as Role)}
        buttons={options.map((r) => ({ value: r, label: r }))}
      />
      <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
        {roleDescriptions[role]}
      </Text>
      <Row gap="12" horizontal="end" s={{ direction: "column-reverse" }}>
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={role === member.role}
          onClick={() => onSave(member, role)}
        >
          Save role
        </Button>
      </Row>
    </Column>
  );
}
