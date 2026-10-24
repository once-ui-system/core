"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Creates an invitation link through the JSON API and shows it once for copying.
export function InviteForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch(`/api/orgs/${encodeURIComponent(slug)}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || undefined, role }),
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) throw new Error(body.error ?? "Could not create the invitation");
      setLink(body.url);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the invitation");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email (optional)</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.example"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <NativeSelect
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as "member" | "admin")}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </NativeSelect>
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create invite link"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {link && (
        <div className="space-y-2 rounded-lg border border-border p-3">
          <p className="text-sm text-muted-foreground">Share this link. It expires in 7 days.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 text-xs">{link}</code>
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
