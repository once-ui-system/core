"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { createOrgAction, renameOrgAction, type ActionState } from "@/app/app/actions";

function Notice({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error) return <p role="alert" className="text-sm text-destructive">{state.error}</p>;
  if (state.message) return <p role="status" className="text-sm text-muted-foreground">{state.message}</p>;
  return null;
}

export function CreateOrgForm() {
  const [state, action, pending] = useActionState(createOrgAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="org-name">Organization name</Label>
          <Input id="org-name" name="name" required maxLength={80} placeholder="Team name" />
        </Field>
      </FieldGroup>
      <Notice state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create organization"}
      </Button>
    </form>
  );
}

export function RenameOrgForm({ slug, name }: { slug: string; name: string }) {
  const [state, action, pending] = useActionState(renameOrgAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <Field>
        <Label htmlFor="rename">Name</Label>
        <Input id="rename" name="name" defaultValue={name} required maxLength={80} />
      </Field>
      <Notice state={state} />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save name"}
        </Button>
      </div>
    </form>
  );
}

export function InviteForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setLink(null);
    setCopied(false);
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(slug)}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || undefined, role }),
      });
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        setError(body.error ?? "The invitation could not be created.");
      } else {
        setLink(body.url);
        setEmail("");
      }
    } catch {
      setError("The invitation could not be created.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field>
          <Label htmlFor="invite-email">Email (optional)</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.example"
          />
        </Field>
        <Field>
          <Label htmlFor="invite-role">Role</Label>
          <NativeSelect id="invite-role" value={role} onChange={(e) => setRole(e.target.value as "member" | "admin")}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </NativeSelect>
        </Field>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {link && (
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-muted-foreground">Share this link. It works for 7 days.</p>
          <code className="break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">{link}</code>
        </div>
      )}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating link..." : "Create invite link"}
        </Button>
      </div>
    </form>
  );
}

export function UpgradeButton({ slug }: { slug: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function upgrade() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(slug)}/billing/checkout`, { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        setError(body.error ?? "Checkout could not be started.");
        setPending(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Checkout could not be started.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button onClick={upgrade} disabled={pending}>
          {pending ? "Opening checkout..." : "Upgrade to Team"}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
