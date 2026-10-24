"use client";

import { Button, Column, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/env";

/** Sets the password of the session the reset link created. */
export function NewPasswordForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await createBrowserSupabase().auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.replace("/app");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Column as="form" gap="16" onSubmit={submit} fillWidth>
      <Input
        id="new-password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        minLength={8}
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Input
        id="confirm-password"
        name="confirm"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        minLength={8}
        required
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
      />
      {error && (
        <Text variant="body-default-s" onBackground="danger-strong" role="alert">
          {error}
        </Text>
      )}
      <Button type="submit" label="Save password" fillWidth loading={busy} disabled={!configured || busy} />
    </Column>
  );
}
