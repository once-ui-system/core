import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailField } from "@/components/auth/fields";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "../actions";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Get a link to reset your Acme Notes password.",
  alternates: { canonical: "/auth/forgot-password" },
  robots: { index: false, follow: false },
};

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  return (
    <AuthShell
      title="Reset your password"
      description="We will email you a link to choose a new password."
      error={error}
      message={message === "sent" ? "If an account exists for that email, a reset link is on its way." : undefined}
    >
      <form action={requestPasswordReset} className="space-y-4">
        <EmailField />
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
      <Link href="/auth" className="text-center text-sm text-muted-foreground hover:text-foreground">
        Back to sign in
      </Link>
    </AuthShell>
  );
}
