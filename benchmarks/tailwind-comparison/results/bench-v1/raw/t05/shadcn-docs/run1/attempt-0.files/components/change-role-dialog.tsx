"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_DESCRIPTIONS, ROLES, type Member, type Role } from "@/lib/data";

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
    <Dialog open={member !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {member ? (
          <ChangeRoleForm key={member.id} member={member} onClose={onClose} onSave={onSave} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ChangeRoleForm({
  member,
  onClose,
  onSave,
}: {
  member: Member;
  onClose: () => void;
  onSave: (id: string, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(member.role);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(member.id, role);
      }}
    >
      <DialogHeader>
        <DialogTitle>Change role</DialogTitle>
        <DialogDescription>
          Choose what {member.name} can do in the Acme Labs workspace.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="change-role-select">Role</FieldLabel>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id="change-role-select" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>{ROLE_DESCRIPTIONS[role]}</FieldDescription>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={role === member.role}>
          Save role
        </Button>
      </DialogFooter>
    </form>
  );
}
