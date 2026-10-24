"use client";

import { useActionState } from "react";
import { createOrg, inviteMember, renameOrg, upgradeToTeam, type ActionState } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Feedback({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <div className="flex flex-col gap-2 text-sm">
      {state.error && <p role="alert" className="text-destructive">{state.error}</p>}
      {state.message && <p role="status" className="text-muted-foreground">{state.message}</p>}
      {state.link && (
        <code className="block break-all rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs">
          {state.link}
        </code>
      )}
    </div>
  );
}

export function NewOrgForm() {
  const [state, action, pending] = useActionState(createOrg, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="org-name">Name</Label>
        <Input id="org-name" name="name" maxLength={80} required placeholder="Design team" />
      </div>
      <Feedback state={state} />
      <Button type="submit" disabled={pending}>Create organization</Button>
    </form>
  );
}

export function InviteForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(inviteMember, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-email">Email (optional)</Label>
          <Input id="invite-email" name="email" type="email" placeholder="Leave empty for an open link" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-role">Role</Label>
          <select
            id="invite-role"
            name="role"
            defaultValue="member"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <Feedback state={state} />
      <Button type="submit" disabled={pending} className="sm:w-fit">
        {pending ? "Creating…" : "Create invite link"}
      </Button>
    </form>
  );
}

export function RenameOrgForm({ slug, name }: { slug: string; name: string }) {
  const [state, action, pending] = useActionState(renameOrg, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="org-rename">Organization name</Label>
        <Input id="org-rename" name="name" defaultValue={name} maxLength={80} required />
      </div>
      <Feedback state={state} />
      <Button type="submit" disabled={pending} className="sm:w-fit">Save name</Button>
    </form>
  );
}

export function UpgradeForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(upgradeToTeam, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      <Feedback state={state} />
      <Button type="submit" disabled={pending} className="sm:w-fit">
        {pending ? "Opening checkout…" : "Upgrade to Team"}
      </Button>
    </form>
  );
}
