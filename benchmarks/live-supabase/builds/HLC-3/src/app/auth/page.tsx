import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailField, PasswordField } from "@/components/auth/fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signIn, signUp } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Acme Notes, or create an account.",
  alternates: { canonical: "/auth" },
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ mode?: string; error?: string; message?: string; next?: string }>;

const MESSAGES: Record<string, string> = {
  "check-email": "Check your email for a confirmation link, then sign in.",
};

export default async function AuthPage({ searchParams }: { searchParams: SearchParams }) {
  const { mode, error, message, next } = await searchParams;
  const signingUp = mode === "sign-up";
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  return (
    <AuthShell
      title={signingUp ? "Create your account" : "Sign in"}
      description={
        signingUp
          ? "Start a workspace for your team."
          : "Welcome back. Sign in to open your workspace."
      }
      error={error}
      message={message ? MESSAGES[message] : undefined}
    >
      {!isSupabaseConfigured() && (
        <p className="text-sm text-muted-foreground">
          Accounts need Supabase. In demo mode you can{" "}
          <Link href="/app" className="text-brand underline underline-offset-4">
            open the demo workspace
          </Link>
          .
        </p>
      )}
      <form action={signingUp ? signUp : signIn} className="space-y-4">
        <input type="hidden" name="next" value={destination} />
        <EmailField />
        <PasswordField
          autoComplete={signingUp ? "new-password" : "current-password"}
        />
        <Button type="submit" className="w-full">
          {signingUp ? "Create account" : "Sign in"}
        </Button>
      </form>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {signingUp ? (
          <Link href="/auth?mode=sign-in" className="hover:text-foreground">
            Already have an account? Sign in
          </Link>
        ) : (
          <>
            <Link href="/auth?mode=sign-up" className="hover:text-foreground">
              New here? Create an account
            </Link>
            <Link href="/auth/forgot-password" className="hover:text-foreground">
              Forgot your password?
            </Link>
          </>
        )}
      </div>
      <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full" })}>
        Back to the home page
      </Link>
    </AuthShell>
  );
}
