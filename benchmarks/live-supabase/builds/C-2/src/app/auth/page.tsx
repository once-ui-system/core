import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { DemoNotice } from "@/components/site/demo-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Acme Notes or create an account.",
};

export default function AuthPage() {
  return (
    <>
      <DemoNotice />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
        <Link href="/" className="text-lg font-semibold">{siteConfig.name}</Link>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <AuthForm configured={isSupabaseConfigured()} />
        </Suspense>
      </div>
    </>
  );
}
