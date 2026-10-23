"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | null;

const NOT_CONFIGURED = "Supabase is not configured, so sign-in is unavailable in demo mode.";

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/app";
};

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string).trim() : "");

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: str(fd, "email"),
    password: str(fd, "password"),
  });
  if (error) return { error: error.message };
  redirect(safeNext(fd.get("next")));
}

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const password = str(fd, "password");
  if (password.length < 6) return { error: "Use a password of at least 6 characters." };
  const next = safeNext(fd.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: str(fd, "email"),
    password,
    options: { emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect(next);
  return { message: "Check your email to confirm your address, then sign in." };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/auth");
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(str(fd, "email"), {
    redirectTo: `${await origin()}/auth/callback?next=/auth/update-password`,
  });
  if (error) return { error: error.message };
  return { message: "If that address has an account, a reset link is on its way." };
}

export async function updatePassword(_: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const password = str(fd, "password");
  if (password.length < 6) return { error: "Use a password of at least 6 characters." };
  if (password !== str(fd, "confirm")) return { error: "The passwords do not match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/app");
}
