"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { originOf, safeNext } from "../auth";
import { isSupabaseConfigured } from "../supabase/config";
import { createSupabaseServerClient } from "../supabase/server";

export type FormState = { error?: string; message?: string; url?: string };

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const MIN_PASSWORD = 8;

const notConfigured = (): FormState => ({
  error: "Supabase is not configured, so accounts are unavailable in demo mode.",
});

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: text(formData, "email"),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: "That email and password do not match an account." };
  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters for the password.` };
  }
  const origin = originOf(await headers());
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: text(formData, "email"),
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/app` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/app");
  return { message: "Check your email and open the confirmation link, then sign in." };
}

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const origin = originOf(await headers());
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(text(formData, "email"), {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  return { message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return notConfigured();
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters for the password.` };
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "This reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/app");
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/auth");
}
