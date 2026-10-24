"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const MIN_PASSWORD_LENGTH = 8;

// Only same-site relative paths are allowed as a post-sign-in destination.
function safeNext(value: FormDataEntryValue | string | null): string {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/app";
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function fieldsOf(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    next: safeNext(formData.get("next")),
  };
}

function backToAuth(mode: "sign-in" | "sign-up", error: string, next?: string): never {
  const params = new URLSearchParams({ mode, error });
  if (next && next !== "/app") params.set("next", next);
  redirect(`/auth?${params.toString()}`);
}

export async function signIn(formData: FormData) {
  const { email, password, next } = fieldsOf(formData);
  if (!isSupabaseConfigured()) backToAuth("sign-in", "Supabase is not configured", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) backToAuth("sign-in", error.message, next);
  redirect(next);
}

export async function signUp(formData: FormData) {
  const { email, password, next } = fieldsOf(formData);
  if (!isSupabaseConfigured()) backToAuth("sign-up", "Supabase is not configured", next);
  if (password.length < MIN_PASSWORD_LENGTH) {
    backToAuth("sign-up", `Use at least ${MIN_PASSWORD_LENGTH} characters for the password`, next);
  }

  const origin = await siteOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) backToAuth("sign-up", error.message, next);
  if (data.session) redirect(next);
  redirect("/auth?mode=sign-in&message=check-email");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!isSupabaseConfigured()) redirect("/auth/forgot-password?error=Supabase%20is%20not%20configured");

  const origin = await siteOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`,
  });
  if (error) redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
  redirect("/auth/forgot-password?message=sent");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!isSupabaseConfigured()) redirect("/auth/update-password?error=Supabase%20is%20not%20configured");
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect(
      `/auth/update-password?error=${encodeURIComponent(
        `Use at least ${MIN_PASSWORD_LENGTH} characters for the password`
      )}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`);
  redirect("/app");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/auth");
}
