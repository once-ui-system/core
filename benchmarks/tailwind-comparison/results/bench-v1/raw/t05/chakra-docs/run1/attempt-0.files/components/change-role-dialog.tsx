"use client";

import { useState } from "react";
import { Button, Stack, Text } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { ROLES, ROLE_DESCRIPTIONS, type Member, type Role } from "@/lib/data";

interface ChangeRoleDialogProps {
  member: Member | null;
  onClose: () => void;
  onChange: (id: string, role: Role) => void;
}

export function ChangeRoleDialog({
  member,
  onClose,
  onChange,
}: ChangeRoleDialogProps) {
  return (
    <DialogRoot
      open={member !== null}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="center"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="4">
        {member ? (
          <ChangeRoleForm
            key={member.id}
            member={member}
            onChange={onChange}
          />
        ) : null}
      </DialogContent>
    </DialogRoot>
  );
}

function ChangeRoleForm({
  member,
  onChange,
}: {
  member: Member;
  onChange: (id: string, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(member.role);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange(member.id, role);
      }}
    >
      <DialogHeader>
        <DialogTitle>Change role for {member.name}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Stack gap="3">
          <Field label="Role">
            <NativeSelectRoot>
              <NativeSelectField
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>
          <Text color="fg.muted" fontSize="sm">
            {ROLE_DESCRIPTIONS[role]}
          </Text>
        </Stack>
      </DialogBody>
      <DialogFooter gap="2">
        <DialogActionTrigger asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogActionTrigger>
        <Button type="submit" colorPalette="orange" disabled={role === member.role}>
          Save role
        </Button>
      </DialogFooter>
      <DialogCloseTrigger />
    </form>
  );
}
