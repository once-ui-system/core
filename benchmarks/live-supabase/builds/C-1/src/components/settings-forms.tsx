"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsForms({
  org,
  name,
  plan,
  canManage,
}: {
  org: string;
  name: string;
  plan: "free" | "team";
  canManage: boolean;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function rename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("name"));
    setBusy(true);
    setError(null);
    setMsg(null);
    const res = await fetch(`/api/orgs/${org}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg("Organization renamed.");
      router.refresh();
    } else setError(body.error ?? "Could not rename");
    setBusy(false);
  }

  async function upgrade() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orgs/${org}/billing/checkout`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.url) window.location.href = body.url;
    else {
      setError(body.error ?? "Could not start checkout");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization name</CardTitle>
          <CardDescription>
            {canManage ? "Only admins and owners can rename the organization." : "Only admins and owners can change this."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={rename} className="flex flex-col gap-4 sm:max-w-md">
            <div className="flex flex-col gap-2">
              <Label htmlFor="org-name">Name</Label>
              <Input id="org-name" name="name" defaultValue={name} required maxLength={80} disabled={!canManage} />
            </div>
            {msg && <p role="status" className="text-sm text-primary">{msg}</p>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy || !canManage}>Save</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Current plan: {plan === "team" ? "Team" : "Free"}</CardDescription>
        </CardHeader>
        <CardContent>
          {plan === "team" ? (
            <p className="text-sm text-muted-foreground">This organization is on the Team plan.</p>
          ) : (
            <Button onClick={upgrade} disabled={busy || !canManage}>Upgrade to Team</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
