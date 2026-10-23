import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForms } from "@/components/site/auth-forms";
import { PageShell } from "@/components/site/header";
import { DemoNotice } from "@/components/site/demo-notice";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Acme Notes or create an account.",
};

export default function AuthPage() {
  return (
    <>
      <DemoNotice />
      <PageShell>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Sign in, create an account, or reset your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <AuthForms />
            </Suspense>
          </CardContent>
        </Card>
      </PageShell>
    </>
  );
}
