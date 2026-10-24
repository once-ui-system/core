"use client";

import { Button, Column, Input, Row, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export type AuthMode = "signin" | "signup" | "forgot";

type Props = {
  initialMode: AuthMode;
  next: string;
  initialError: string | null;
  configured: boolean;
};

/** Sign in, sign up and forgot password, on one form with the email and password fields. */
export function AuthForm({ initialMode, next, initialError, configured }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [message, setMessage] = useState<string | null>(null);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setMessage(null);
  };

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createBrowserSupabase();
      const origin = window.location.origin;

      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (data.session) {
          router.replace(next);
          router.refresh();
          return;
        }
        setMessage("Check your email for a confirmation link, then sign in.");
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setMessage("If an account exists for that email, a password reset link is on its way.");
    } finally {
      setBusy(false);
    }
  };

  const heading = mode === "forgot" ? "Send reset link" : mode === "signup" ? "Create account" : "Sign in";

  return (
    <Column as="form" gap="16" onSubmit={submit} fillWidth>
      <Input
        id="auth-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {mode !== "forgot" && (
        <Input
          id="auth-password"
          name="password"
          type="password"
          label="Password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={mode === "signup" ? 8 : undefined}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      )}
      {error && (
        <Text variant="body-default-s" onBackground="danger-strong" role="alert">
          {error}
        </Text>
      )}
      {message && (
        <Text variant="body-default-s" onBackground="success-strong" role="status">
          {message}
        </Text>
      )}
      <Button type="submit" label={heading} fillWidth loading={busy} disabled={!configured || busy} />
      <Row gap="16" wrap horizontal="center">
        {mode !== "signin" && (
          <Button variant="tertiary" size="s" label="Sign in" onClick={() => switchMode("signin")} />
        )}
        {mode !== "signup" && (
          <Button variant="tertiary" size="s" label="Create an account" onClick={() => switchMode("signup")} />
        )}
        {mode !== "forgot" && (
          <Button variant="tertiary" size="s" label="Forgot password?" onClick={() => switchMode("forgot")} />
        )}
      </Row>
    </Column>
  );
}
