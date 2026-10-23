"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InviteForm({ org }: { org: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    setUrl(null);
    const res = await fetch(`/api/orgs/${org}/invitations`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: String(f.get("email") ?? "") || undefined, role: String(f.get("role")) }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setUrl(body.url);
    else setError(body.error ?? "Could not create the invitation");
    setBusy(false);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite people</CardTitle>
        <CardDescription>Create a link that expires after 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4 sm:max-w-md">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email">Email (optional)</Label>
            <Input id="invite-email" name="email" type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <NativeSelect id="invite-role" name="role" defaultValue="member">
              <NativeSelectOption value="member">Member</NativeSelectOption>
              <NativeSelectOption value="admin">Admin</NativeSelectOption>
            </NativeSelect>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {url && (
            <p className="break-all text-sm">
              Invitation link: <code>{url}</code>
            </p>
          )}
          <Button type="submit" disabled={busy}>Create invitation link</Button>
        </form>
      </CardContent>
    </Card>
  );
}
