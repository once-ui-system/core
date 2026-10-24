"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Column, Feedback, Heading, Input } from "@once-ui-system/core";
import { createBrowserSupabase } from "@/lib/sb/browser";

/** Sets a new password for the session the reset link opened. */
export function UpdatePasswordForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || busy) return;
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");

    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await createBrowserSupabase().auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/app");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not set the password. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Column gap="24">
      <Heading as="h1" variant="display-strong-xs">
        Set a new password
      </Heading>
      {!configured && (
        <Feedback
          variant="warning"
          title="Supabase is not configured"
          description="Password reset needs Supabase. Set the variables in .env."
        />
      )}
      <form onSubmit={submit}>
        <Column gap="16">
          <Input
            id="password"
            name="password"
            type="password"
            label="New password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            disabled={!configured}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Input
            id="confirm"
            name="confirm"
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            disabled={!configured}
            onChange={(event) => setConfirm(event.target.value)}
          />
          <Button type="submit" variant="primary" fillWidth loading={busy} disabled={!configured} label="Save password" />
        </Column>
      </form>
      {error && <Feedback variant="danger" description={error} />}
    </Column>
  );
}
