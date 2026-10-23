import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdatePasswordForm } from "@/components/site/auth-forms";
import { PageShell } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Acme Notes account.",
};

export default function UpdatePasswordPage() {
  return (
    <PageShell>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>Choose a password of at least 6 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <UpdatePasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </PageShell>
  );
}
