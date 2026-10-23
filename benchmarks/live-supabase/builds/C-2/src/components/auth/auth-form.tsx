"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Mode = "signin" | "signup" | "forgot";

const copy: Record<Mode, { title: string; desc: string; cta: string }> = {
  signin: { title: "Sign in", desc: "Welcome back to Acme Notes.", cta: "Sign in" },
  signup: { title: "Create your account", desc: "Start sharing notes with your team.", cta: "Sign up" },
  forgot: { title: "Reset your password", desc: "We will email you a link to set a new one.", cta: "Send reset link" },
};

function safeNext(v: string | null) {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/app";
}

export function AuthForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") ? "That link did not work. Try again." : null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const supabase = createClient();
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
        } else setInfo("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
        });
        if (error) throw error;
        setInfo("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const c = copy[mode];
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{c.title}</CardTitle>
        <CardDescription>{c.desc}</CardDescription>
      </CardHeader>
      <CardContent>
        {!configured ? (
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Supabase is not configured, so sign-in is turned off in demo mode.
            </p>
            <Link href="/app" className={buttonVariants({ className: "w-full" })}>Open the demo app</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {info && <p role="status" className="text-sm text-primary">{info}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{c.cta}</Button>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              {mode !== "signin" && <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("signin")}>Have an account? Sign in</button>}
              {mode !== "signup" && <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("signup")}>New here? Create an account</button>}
              {mode === "signin" && <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("forgot")}>Forgot your password?</button>}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
