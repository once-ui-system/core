import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { isSafeNext } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SignInForm, SignUpForm } from "@/components/auth/auth-forms";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = pageMetadata({ title: "Sign in", description: "Sign in to Acme Notes or create an account.", path: "/auth" });

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = isSafeNext(next) ? next : "/app";
  const configured = isSupabaseConfigured();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
        {!configured ? (
          <Card>
            <CardHeader>
              <CardTitle>Demo mode</CardTitle>
              <CardDescription>
                Supabase is not configured, so there is no sign-in. The app shows sample data instead.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app" className={buttonVariants({ className: "w-full" })}>
                Open the demo app
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {error === "link" && (
              <p role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">
                That link is invalid or has expired. Request a new one.
              </p>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>
                  <Link href="/auth/forgot-password" className="text-primary hover:underline">
                    Forgot your password?
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignInForm next={safeNext} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Start with a free organization for up to three members.</CardDescription>
              </CardHeader>
              <CardContent>
                <SignUpForm />
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
