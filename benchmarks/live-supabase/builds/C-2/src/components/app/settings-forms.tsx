"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { slug: string; name: string; plan: "free" | "team"; canManage: boolean; live: boolean };

export function SettingsForms({ slug, name: initial, plan, canManage, live }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const api = `/api/orgs/${encodeURIComponent(slug)}`;

  async function rename(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setMsg(null);
    const res = await fetch(api, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(body.error ?? "Could not rename");
    setMsg("Saved.");
    router.refresh();
  }

  async function upgrade() {
    setBusy(true); setError(null);
    const res = await fetch(`${api}/billing/checkout`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) {
      setBusy(false);
      return setError(body.error ?? "Could not start checkout");
    }
    window.location.href = body.url;
  }

  return (
    <div className="grid max-w-xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization name</CardTitle>
          <CardDescription>Only admins and owners can rename the organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={rename} className="space-y-3">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required maxLength={120} value={name} disabled={!canManage || !live}
              onChange={(e) => setName(e.target.value)} />
            {msg && <p role="status" className="text-sm text-primary">{msg}</p>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {canManage && live && <Button type="submit" disabled={busy}>Save</Button>}
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Plan <Badge>{plan === "team" ? "Team" : "Free"}</Badge></CardTitle>
          <CardDescription>Free covers up to 3 members. Team is $8 per member per month.</CardDescription>
        </CardHeader>
        <CardContent>
          {plan === "free" && canManage && live ? (
            <Button onClick={upgrade} disabled={busy}>Upgrade to Team</Button>
          ) : plan === "team" ? (
            <p className="text-sm text-muted-foreground">This organization is on the Team plan.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Only admins and owners can change the plan.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
