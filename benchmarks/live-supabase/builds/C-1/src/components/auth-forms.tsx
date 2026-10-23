"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBrowserSupabase } from "@/lib/supabase/client";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function Shell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!configured && (
            <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
              Supabase is not configured, so this form is off. <Link href="/app" className="underline">Open the demo app</Link>.
            </p>
          )}
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

function useAction() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return { error, setError, info, setInfo, busy, setBusy };
}

function Status({ error, info }: { error: string | null; info: string | null }) {
  return (
    <>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {info && <p role="status" className="text-sm text-primary">{info}</p>}
    </>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const a = useAction();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured) return;
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    a.setBusy(true);
    a.setError(null);
    a.setInfo(null);
    const supabase = createBrowserSupabase();
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) a.setError(error.message);
      else {
        router.push("/app");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=/app` },
      });
      if (error) a.setError(error.message);
      else if (data.session) {
        router.push("/app");
        router.refresh();
      } else a.setInfo("Check your email to confirm your account.");
    }
    a.setBusy(false);
  }

  return (
    <Shell
      title={mode === "in" ? "Sign in" : "Create your account"}
      description={mode === "in" ? "Welcome back to Acme Notes." : "Start taking notes with your team."}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} />
        </div>
        <Status error={a.error} info={a.info} />
        <Button type="submit" disabled={a.busy || !configured}>
          {mode === "in" ? "Sign in" : "Sign up"}
        </Button>
      </form>
      <div className="flex justify-between text-sm">
        <button type="button" className="text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        <Link href="/auth/forgot" className="text-muted-foreground underline">Forgot password?</Link>
      </div>
    </Shell>
  );
}

export function ForgotForm() {
  const a = useAction();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured) return;
    const email = String(new FormData(e.currentTarget).get("email"));
    a.setBusy(true);
    a.setError(null);
    const { error } = await createBrowserSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
    });
    if (error) a.setError(error.message);
    else a.setInfo("If the address has an account, a reset link is on its way.");
    a.setBusy(false);
  }
  return (
    <Shell title="Forgot password" description="We will email you a link to set a new one.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <Status error={a.error} info={a.info} />
        <Button type="submit" disabled={a.busy || !configured}>Send reset link</Button>
      </form>
      <Link href="/auth" className="text-sm text-muted-foreground underline">Back to sign in</Link>
    </Shell>
  );
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const a = useAction();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured) return;
    const password = String(new FormData(e.currentTarget).get("password"));
    a.setBusy(true);
    a.setError(null);
    const { error } = await createBrowserSupabase().auth.updateUser({ password });
    if (error) a.setError(error.message);
    else {
      router.push("/app");
      router.refresh();
    }
    a.setBusy(false);
  }
  return (
    <Shell title="Set a new password" description="Choose a password for your account.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
        </div>
        <Status error={a.error} info={a.info} />
        <Button type="submit" disabled={a.busy || !configured}>Update password</Button>
      </form>
    </Shell>
  );
}
