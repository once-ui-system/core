"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Column, Feedback, Heading, Input, Row, Text } from "@once-ui-system/core";
import { createBrowserSupabase } from "@/lib/sb/browser";

type Mode = "login" | "signup" | "forgot";

const TITLES: Record<Mode, string> = {
  login: "Sign in to Acme Notes",
  signup: "Create your account",
  forgot: "Reset your password",
};

/**
 * Sign in, sign up and forgot password. Without Supabase the form is shown
 * disabled with a notice. A reset link returns through /auth/callback to
 * /auth/update-password.
 */
export function AuthForm({
  configured,
  initialMode,
  next,
}: {
  configured: boolean;
  initialMode: Mode;
  next: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || busy) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const supabase = createBrowserSupabase();
      const origin = window.location.origin;

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace(next);
        router.refresh();
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          setNotice("Check your email for a link to confirm your account.");
        }
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`,
        });
        if (resetError) throw resetError;
        setNotice("If an account exists for that address, a reset link is on its way.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Column gap="24">
      <Heading as="h1" variant="display-strong-xs">
        {TITLES[mode]}
      </Heading>

      {!configured && (
        <Feedback
          variant="warning"
          title="Supabase is not configured"
          description="This is demo mode. Set the Supabase variables in .env to turn on sign-in."
        />
      )}

      <form onSubmit={submit}>
        <Column gap="16">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
            value={email}
            disabled={!configured}
            onChange={(event) => setEmail(event.target.value)}
          />
          {mode !== "forgot" && (
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              disabled={!configured}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
          <Button
            type="submit"
            variant="primary"
            fillWidth
            loading={busy}
            disabled={!configured}
            label={mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          />
        </Column>
      </form>

      {error && <Feedback variant="danger" description={error} />}
      {notice && <Feedback variant="success" description={notice} />}

      <Row gap="16" wrap horizontal="between">
        {mode !== "login" && (
          <Button variant="tertiary" size="s" label="Sign in instead" onClick={() => setMode("login")} />
        )}
        {mode === "login" && (
          <>
            <Button variant="tertiary" size="s" label="Create an account" onClick={() => setMode("signup")} />
            <Button variant="tertiary" size="s" label="Forgot password?" onClick={() => setMode("forgot")} />
          </>
        )}
      </Row>

      <Text variant="body-default-s" onBackground="neutral-weak">
        By continuing you agree to the terms and privacy policy.
      </Text>
    </Column>
  );
}
