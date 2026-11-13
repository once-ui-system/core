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
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { ROLES, ROLE_DESCRIPTIONS, type Member, type Role } from "@/lib/data";

interface ChangeRoleDialogProps {
  member: Member | null;
  onClose: () => void;
  onChange: (id: string, role: Role) => void;
}

export function ChangeRoleDialog({ member, onClose, onChange }: ChangeRoleDialogProps) {
  return (
    <DialogRoot
      open={member !== null}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      placement="center"
    >
      {member && (
        <ChangeRoleBody key={member.id} member={member} onClose={onClose} onChange={onChange} />
      )}
    </DialogRoot>
  );
}

function ChangeRoleBody({
  member,
  onClose,
  onChange,
}: {
  member: Member;
  onClose: () => void;
  onChange: (id: string, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(member.role);

  return (
    <DialogContent mx="4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onChange(member.id, role);
          onClose();
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
                  items={ROLES}
                />
              </NativeSelectRoot>
            </Field>
            <Text fontSize="sm" color="fg.muted">
              {ROLE_DESCRIPTIONS[role]}
            </Text>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button type="submit" colorPalette="blue" disabled={role === member.role}>
            Save role
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </form>
    </DialogContent>
  );
}
