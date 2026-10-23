"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function accept() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/invitations/${encodeURIComponent(token)}`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(body.org ? `/app/${body.org}` : "/app");
      router.refresh();
    } else setError(body.error ?? "Could not accept the invitation");
    setBusy(false);
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">You are invited</CardTitle>
        <CardDescription>Join the organization on Acme Notes.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button onClick={accept} disabled={busy}>Accept invitation</Button>
      </CardContent>
    </Card>
  );
}
