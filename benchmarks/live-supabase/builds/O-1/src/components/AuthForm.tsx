"use client";

import { Button, Column, Heading, Input, SmartLink, Text } from "@once-ui-system/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "../lib/supabase/browser";
import { isSupabaseConfigured } from "../lib/supabase/config";

export type AuthMode = "signin" | "signup" | "forgot" | "update";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/app");

export function AuthForm({ mode: initial }: { mode: AuthMode }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [mode, setMode] = useState<AuthMode>(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const configured = isSupabaseConfigured();

  const titles: Record<AuthMode, string> = {
    signin: "Sign in",
    signup: "Create your account",
    forgot: "Reset your password",
    update: "Set a new password",
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!configured) return;
    setBusy(true);
    try {
      const supabase = createBrowserSupabase();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setInfo("Check your email to confirm your account, then sign in.");
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
        });
        if (error) throw error;
        setInfo("If that email has an account, a reset link is on its way.");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        router.push("/app");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Column fillWidth maxWidth="xs" gap="24" background="surface" border radius="l" padding="32">
      <Heading as="h1" variant="heading-strong-xl">
        {titles[mode]}
      </Heading>
      {!configured && (
        <Column gap="8" role="status">
          <Text onBackground="neutral-weak">
            Supabase is not configured, so this app runs in demo mode and sign-in is off.
          </Text>
          <Button href="/app" label="Open the demo app" variant="secondary" />
        </Column>
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
              autoComplete="email"
            />
          )}
          {mode !== "forgot" && (
            <Input
              id="password"
              type="password"
              label={mode === "update" ? "New password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          )}
          {error && (
            <Text role="alert" onBackground="danger-medium" variant="body-default-s">
              {error}
            </Text>
          )}
          {info && (
            <Text role="status" onBackground="brand-medium" variant="body-default-s">
              {info}
            </Text>
          )}
          <Button type="submit" fillWidth loading={busy} disabled={!configured} label={titles[mode]} />
        </Column>
      </form>
      <Column gap="8">
        {mode === "signin" && (
          <>
            <Text variant="body-default-s" onBackground="neutral-weak">
              New here?{" "}
              <SmartLink href="#" onClick={(e) => { e.preventDefault(); setMode("signup"); }}>
                Create an account
              </SmartLink>
            </Text>
            <SmartLink href="/auth/forgot">Forgot your password?</SmartLink>
          </>
        )}
        {mode === "signup" && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Have an account?{" "}
            <SmartLink href="#" onClick={(e) => { e.preventDefault(); setMode("signin"); }}>
              Sign in
            </SmartLink>
          </Text>
        )}
        {mode === "forgot" && <SmartLink href="/auth">Back to sign in</SmartLink>}
      </Column>
    </Column>
  );
}
