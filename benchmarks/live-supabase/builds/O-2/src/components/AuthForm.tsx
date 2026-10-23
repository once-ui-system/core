"use client";

import { Button, Column, Heading, Input, PasswordInput, Row, Text } from "@once-ui-system/core";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

type Mode = "signin" | "signup" | "forgot" | "update";

const copy: Record<Mode, { title: string; cta: string }> = {
  signin: { title: "Sign in", cta: "Sign in" },
  signup: { title: "Create your account", cta: "Sign up" },
  forgot: { title: "Reset your password", cta: "Send reset link" },
  update: { title: "Set a new password", cta: "Update password" },
};

export function AuthForm({
  supabaseUrl,
  anonKey,
  initialMode = "signin",
  next = "/app",
}: {
  supabaseUrl: string;
  anonKey: string;
  initialMode?: Mode;
  next?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const configured = Boolean(supabaseUrl && anonKey);

  const go = (path: string) => window.location.assign(path);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError("");
    setInfo("");
    const supabase = createBrowserClient(supabaseUrl, anonKey);
    const origin = window.location.origin;
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        go(next);
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback?next=/app` },
        });
        if (error) throw error;
        if (data.session) go(next);
        else setInfo("Check your email to confirm your account.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
        });
        if (error) throw error;
        setInfo("If that email has an account, a reset link is on its way.");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        go("/app");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth={28} fillWidth background="surface" border radius="l" padding="32" gap="24">
        <Heading as="h1" variant="heading-strong-xl">
          {copy[mode].title}
        </Heading>
        {!configured && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Supabase is not configured, so this app is in demo mode. Sign-in is switched off and the{" "}
            <a href="/app">app</a> is open with sample data.
          </Text>
        )}
        <form onSubmit={submit}>
          <Column gap="16">
            {mode !== "update" && (
              <Input
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
            {mode !== "forgot" && (
              <PasswordInput
                id="password"
                label={mode === "update" ? "New password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            )}
            {error && (
              <Text role="alert" variant="body-default-s" onBackground="danger-strong">
                {error}
              </Text>
            )}
            {info && <Text variant="body-default-s">{info}</Text>}
            <Button type="submit" fillWidth loading={busy} disabled={!configured} label={copy[mode].cta} />
          </Column>
        </form>
        {mode !== "update" && (
          <Row gap="16" wrap horizontal="between">
            {mode === "signin" ? (
              <>
                <Button variant="tertiary" size="s" label="Create an account" onClick={() => setMode("signup")} />
                <Button variant="tertiary" size="s" label="Forgot password?" onClick={() => setMode("forgot")} />
              </>
            ) : (
              <Button variant="tertiary" size="s" label="Back to sign in" onClick={() => setMode("signin")} />
            )}
          </Row>
        )}
      </Column>
    </Column>
  );
}
