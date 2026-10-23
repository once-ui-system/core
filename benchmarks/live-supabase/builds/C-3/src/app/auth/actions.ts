"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { createSessionClient } from "@/lib/sb/server";

export type FormState = { error?: string; message?: string } | undefined;

function safeNext(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/app";
}

const NOT_CONFIGURED = "Supabase is not configured, so sign-in is off in demo mode.";

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) redirect("/app");
  const sb = await createSessionClient();
  const { error } = await sb.auth.signInWithPassword({
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
  });
  if (error) return { error: error.message };
  redirect(safeNext(fd.get("next")));
}

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) redirect("/app");
  const sb = await createSessionClient();
  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await sb.auth.signUp({
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect(safeNext(fd.get("next")));
  return { message: "Check your email to confirm your account." };
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const sb = await createSessionClient();
  const origin = (await headers()).get("origin") ?? "";
  const { error } = await sb.auth.resetPasswordForEmail(String(fd.get("email") ?? ""), {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  if (error) return { error: error.message };
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const password = String(fd.get("password") ?? "");
  if (password.length < 6) return { error: "Use at least 6 characters." };
  const sb = await createSessionClient();
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/app");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const sb = await createSessionClient();
    await sb.auth.signOut();
  }
  redirect("/auth");
}
