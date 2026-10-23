"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  createOrgAction,
  inviteAction,
  renameOrgAction,
  type ActionState,
} from "@/app/app/actions";

function Status({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <div role="status" className="space-y-1 text-sm">
      <p className={state.error ? "text-destructive" : "text-primary"}>{state.error ?? state.message}</p>
      {state.url && (
        <Input readOnly value={state.url} onFocus={(e) => e.currentTarget.select()} aria-label="Invitation link" />
      )}
    </div>
  );
}

export function CreateOrgForm() {
  const [state, action, pending] = useActionState(createOrgAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Organization name</Label>
        <Input id="name" name="name" required maxLength={120} />
      </div>
      <Status state={state} />
      <Button type="submit" disabled={pending}>
        Create organization
      </Button>
    </form>
  );
}

export function InviteForm({ org }: { org: string }) {
  const [state, action, pending] = useActionState(inviteAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="org" value={org} />
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email (optional)</Label>
          <Input id="invite-email" name="email" type="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <NativeSelect id="invite-role" name="role" defaultValue="member">
            <NativeSelectOption value="member">Member</NativeSelectOption>
            <NativeSelectOption value="admin">Admin</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>
      <Status state={state} />
      <Button type="submit" disabled={pending}>
        Create invitation link
      </Button>
    </form>
  );
}

export function RenameForm({ org, name }: { org: string; name: string }) {
  const [state, action, pending] = useActionState(renameOrgAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="org" value={org} />
      <div className="space-y-2">
        <Label htmlFor="org-name">Organization name</Label>
        <Input id="org-name" name="name" defaultValue={name} required maxLength={120} />
      </div>
      <Status state={state} />
      <Button type="submit" disabled={pending}>
        Save
      </Button>
    </form>
  );
}
