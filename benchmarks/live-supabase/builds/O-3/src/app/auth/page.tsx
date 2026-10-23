import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Acme Notes or create an account.",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : undefined;
  return <AuthCard kind="auth" next={next} linkError={sp.error === "link"} />;
}
