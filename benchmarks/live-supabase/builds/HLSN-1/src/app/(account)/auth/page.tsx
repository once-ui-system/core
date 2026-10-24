import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { safeNext } from "@/lib/redirect";
import { baseURL, auth } from "@/resources";

// Depends on the environment at request time (demo mode or live Supabase).
export const dynamic = "force-dynamic";

const seo = auth.signIn;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  robots: seo.robots,
  alternates: { canonical: seo.path },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; next?: string }>;
}) {
  const { state, next } = await searchParams;
  return (
    <AuthForm
      configured={isSupabaseConfigured()}
      initialMode={state === "signup" ? "signup" : "login"}
      next={safeNext(next)}
    />
  );
}
