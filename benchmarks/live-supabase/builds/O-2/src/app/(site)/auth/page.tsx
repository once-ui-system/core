import type { Metadata } from "next";
import { AuthForm } from "../../../components/AuthForm";
import { supabaseConfig } from "../../../lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Acme Notes or create an account.",
};

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const { url, anonKey } = supabaseConfig();
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return <AuthForm supabaseUrl={url} anonKey={anonKey} next={safe} />;
}
