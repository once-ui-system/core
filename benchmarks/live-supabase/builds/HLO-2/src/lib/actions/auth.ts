"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { requestOrigin, safeNextPath } from "@/lib/http";
import { createSessionClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

const NOT_CONFIGURED = "Supabase is not configured, so sign-in is off in demo mode.";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

async function originOf(): Promise<string> {
  return requestOrigin(await headers());
}

export async function authenticateAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const mode = field(formData, "mode") === "signup" ? "signup" : "signin";
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(field(formData, "next"));
  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use at least 8 characters for the password." };

  const sb = await createSessionClient();
  if (mode === "signup") {
    const origin = await originOf();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) return { error: error.message };
    if (data.session) redirect(next);
    return { message: "Check your email for a confirmation link to finish creating your account." };
  }

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: "That email and password do not match an account." };
  redirect(next);
}

export async function requestPasswordResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const email = field(formData, "email");
  if (!email.includes("@")) return { error: "Enter a valid email address." };
  const origin = await originOf();
  const sb = await createSessionClient();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`,
  });
  if (error) return { error: "The reset email could not be sent. Try again in a moment." };
  return { message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters for the password." };
  const sb = await createSessionClient();
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { error: "The password could not be changed. Request a new reset link." };
  redirect("/app");
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = await createSessionClient();
    await sb.auth.signOut();
  }
  redirect("/auth");
}
