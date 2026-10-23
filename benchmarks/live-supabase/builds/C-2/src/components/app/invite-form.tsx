"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export function InviteForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setLink(null);
    const res = await fetch(`/api/orgs/${encodeURIComponent(slug)}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, ...(email ? { email } : {}) }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(body.error ?? "Could not create the invitation");
    setLink(body.url);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email (optional)</Label>
        <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <NativeSelect id="invite-role" value={role} onChange={(e) => setRole(e.target.value)}>
          <NativeSelectOption value="member">Member</NativeSelectOption>
          <NativeSelectOption value="admin">Admin</NativeSelectOption>
        </NativeSelect>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy}>Create invite link</Button>
      {link && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Share this link. It expires in 7 days.</p>
          <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}
    </form>
  );
}
